import Answer from '#models/answer'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import Question from '#models/question'
import UserResponse from '#models/user_response'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { Server } from 'socket.io'
import ws_service from './ws_service.js'

interface ActiveExam {
  examGradeId: number
  examId: number
  userId: number
  startTime: DateTime
  duration: number // en secondes
  timer?: NodeJS.Timeout
}

/**
 * This service manages the lifecycle of exams, including timing and automatic correction.
 * It uses Socket.IO to communicate real-time updates to clients.
 * It follows the singleton pattern to ensure a single instance throughout the application.
 */
class ExamService {
  private static instance: ExamService
  private activeExams: Map<string, ActiveExam> = new Map()
  private io: Server | undefined

  constructor() {
    this.io = ws_service.io
  }

  //Singleton pattern
  public static getInstance(): ExamService {
    if (!ExamService.instance) {
      ExamService.instance = new ExamService()
    }
    return ExamService.instance
  }

  private getKey(userId: number, examId: number): string {
    return `${userId}-${examId}`
  }

  /**
   * Démarre un examen
   */
  async startExam(userId: number, examId: number, examGradeId: number, duration: number) {
    const key = this.getKey(userId, examId)

    // Si un examen est déjà en cours, on le nettoie
    if (this.activeExams.has(key)) {
      this.stopTimer(key)
    }

    const startTime = DateTime.now()

    const activeExam: ActiveExam = {
      examGradeId,
      examId,
      userId,
      startTime,
      duration,
    }

    // Démarrer le timer qui vérifie chaque seconde
    activeExam.timer = setInterval(() => {
      this.checkExamStatus(key)
    }, 1000)

    this.activeExams.set(key, activeExam)

    console.log(`[ExamTimer] Examen ${examId} démarré pour l'utilisateur ${userId}`)

    // Émettre immédiatement le premier tick
    this.emitTick(activeExam, 0)
  }

  /**
   * Vérifie le statut de l'examen et émet les événements
   */
  private checkExamStatus(key: string) {
    const activeExam = this.activeExams.get(key)
    if (!activeExam) return

    const elapsed = DateTime.now().diff(activeExam.startTime, 'seconds').seconds
    const remaining = activeExam.duration - elapsed

    // Émettre le temps restant via Socket.IO
    this.emitTick(activeExam, elapsed)

    // Si le temps est écoulé, terminer automatiquement l'examen
    if (remaining <= 0) {
      console.log(`[ExamTimer] Temps écoulé pour l'examen ${activeExam.examId}`)
      this.finishExam(activeExam.userId, activeExam.examId, 'timeout')
    }
  }

  /**
   * Émet un événement tick via Socket.IO
   */
  private emitTick(activeExam: ActiveExam, elapsed: number) {
    if (!this.io) return

    const remaining = activeExam.duration - elapsed

    this.io
      .to(`exam-session-user-${activeExam.userId}-exam-${activeExam.examId}`)
      .emit('exam:tick', {
        elapsedInSecondes: Math.floor(elapsed),
        remainingInSecondes: Math.max(0, Math.floor(remaining)),
        durationInSecondes: activeExam.duration,
      })
  }

  /**
   * Arrête manuellement un examen (utilisé dans le controller)
   */
  async stopExam(userId: number, examId: number) {
    return await this.finishExam(userId, examId, 'stopped')
  }

  /**
   * Termine un examen et applique la logique de correction
   */
  private async finishExam(userId: number, examId: number, reason: 'timeout' | 'stopped') {
    const key = this.getKey(userId, examId)
    const activeExam = this.activeExams.get(key)

    if (!activeExam) {
      console.log(`[ExamTimer] Tentative de terminer un examen non actif: ${examId}`)
      return { error: true, message: 'No active exam found' }
    }

    // Arrêter le timer
    this.stopTimer(key)

    try {
      // Appliquer la logique de correction
      await this.processExamCorrection(userId, examId, activeExam.examGradeId)

      // Émettre un événement de fin via Socket.IO
      if (this.io) {
        this.io
          .to(`exam-session-user-${activeExam.userId}-exam-${activeExam.examId}`)
          .emit('exam:finished', {
            success: true,
            message: 'Exam finished successfully',
          })
      }

      console.log(
        `[ExamTimer] Examen ${examId} terminé pour l'utilisateur ${userId} (raison: ${reason})`
      )
      return { success: true, message: 'Exam finished successfully' }
    } catch (error) {
      console.error(`[ExamTimer] Erreur lors de la finalisation de l'examen ${examId}:`, error)

      // Émettre un événement d'erreur
      if (this.io) {
        this.io.to(`user-${userId}`).emit('exam:finished', {
          error: true,
          message: 'An error occurred while finishing the exam',
        })
      }
      return { error: true, message: 'An error occurred while finishing the exam' }
    } finally {
      // Supprimer de la map dans tous les cas
      this.activeExams.delete(key)
    }
  }

  /**
   * Logique de correction de l'examen
   */
  private async processExamCorrection(
    userId: number,
    examId: number,
    examGradeId: number
  ): Promise<{ status: string; score?: number }> {
    // Récupérer l'ExamGrade
    const pendingExamGrade = await ExamGrade.query()
      .where('id_exam_grade', examGradeId)
      .andWhere('id_exam', examId)
      .andWhere('id_user', userId)
      .andWhere('status', 'en cours')
      .first()

    if (!pendingExamGrade) {
      console.log(`[ExamTimer] ExamGrade introuvable ou déjà terminé: ${examGradeId}`)
      throw new Error('ExamGrade not found')
    }

    const exam = await Exam.findOrFail(examId)

    // Récupérer toutes les données nécessaires
    const [questionsOfExam, userResponses, allAnswers] = await Promise.all([
      Question.query().where('id_exam', examId),
      UserResponse.query().where('id_exam', examId).andWhere('id_user', userId),
      Answer.query().where('id_exam', examId),
    ])

    // Créer les réponses manquantes si nécessaire
    const questionsWithoutResponse = questionsOfExam.filter((question) => {
      return !userResponses.some((response) => response.idQuestion === question.idQuestion)
    })

    if (questionsWithoutResponse.length > 0) {
      const newUserResponses = await UserResponse.createMany(
        questionsWithoutResponse.map((question) => ({
          idUser: userId,
          idExam: examId,
          idQuestion: question.idQuestion,
          custom: null,
        }))
      )
      userResponses.push(...newUserResponses)
    }

    // Récupérer les réponses sélectionnées par l'utilisateur
    const userResponsesAnswers = await db
      .query()
      .from('user_responses_answers')
      .whereIn(
        'id_user_response',
        userResponses.map((response) => response.idUserResponse)
      )

    let totalScore = 0
    let allQuestionsAreCorrectable = true
    const evaluationsToCreate = []

    // Traiter chaque question
    for (const question of questionsOfExam) {
      if (question.isQcm) {
        const questionAnswers = allAnswers.filter(
          (answer) => answer.idQuestion === question.idQuestion
        )
        const correctAnswers = questionAnswers.filter((answer) => answer.isCorrect)

        const userResponse = userResponses.find(
          (response) => response.idQuestion === question.idQuestion
        )
        if (!userResponse) continue

        const userSelectedAnswers = userResponsesAnswers.filter(
          (ura) => ura.id_user_response === userResponse.idUserResponse
        )

        let questionScore = 0

        if (question.isMultiple) {
          const hasAllCorrectAnswers = correctAnswers.every((correctAnswer) =>
            userSelectedAnswers.some((ura) => ura.id_answer === correctAnswer.idAnswer)
          )

          const hasOnlyCorrectAnswers = userSelectedAnswers.every((userAnswer) =>
            correctAnswers.some((correctAnswer) => correctAnswer.idAnswer === userAnswer.id_answer)
          )

          if (hasAllCorrectAnswers && hasOnlyCorrectAnswers && userSelectedAnswers.length > 0) {
            questionScore = Number.parseInt(question.maxPoints as unknown as string)
          }
        } else {
          if (userSelectedAnswers.length === 1) {
            const selectedAnswer = userSelectedAnswers[0]
            const isCorrect = correctAnswers.some(
              (correctAnswer) => correctAnswer.idAnswer === selectedAnswer.id_answer
            )

            if (isCorrect) {
              questionScore = Number.parseInt(question.maxPoints as unknown as string)
            }
          }
        }

        evaluationsToCreate.push({
          note: questionScore,
          id_student: userId,
          id_teacher: exam.idTeacher,
          id_user_response: userResponse.idUserResponse,
          created_at: DateTime.now().toSQL(),
          updated_at: DateTime.now().toSQL(),
        })

        totalScore += questionScore
      } else {
        allQuestionsAreCorrectable = false
      }
    }

    // Créer toutes les évaluations
    if (evaluationsToCreate.length > 0) {
      await db.table('evaluations').multiInsert(evaluationsToCreate)
    }

    // Mettre à jour l'ExamGrade
    const updateData: any = {
      updatedAt: DateTime.now(),
    }

    if (allQuestionsAreCorrectable) {
      updateData.status = 'corrigé'
      updateData.note = totalScore
    } else {
      updateData.status = 'à corrigé'
    }

    await pendingExamGrade.merge(updateData).save()

    console.log(
      `[ExamTimer] Examen ${examId} corrigé - Status: ${updateData.status}, Score: ${
        allQuestionsAreCorrectable ? totalScore : 'N/A'
      }`
    )

    return {
      status: updateData.status,
      score: allQuestionsAreCorrectable ? totalScore : undefined,
    }
  }

  /**
   * Arrête le timer sans terminer l'examen (pour cleanup)
   */
  private stopTimer(key: string) {
    const activeExam = this.activeExams.get(key)
    if (activeExam?.timer) {
      clearInterval(activeExam.timer)
    }
  }

  /**
   * Récupère les informations d'un examen en cours
   */
  getActiveExam(userId: number, examId: number): ActiveExam | undefined {
    const key = this.getKey(userId, examId)
    return this.activeExams.get(key)
  }

  /**
   * Récupère le temps restant pour un examen en cours
   * @returns Un objet contenant le temps écoulé, restant et la durée totale en secondes, ou undefined si l'examen n'est pas actif
   */
  getRemainingTime(
    userId: number,
    examId: number
  ):
    | { elapsedInSecondes: number; remainingInSecondes: number; durationInSecondes: number }
    | undefined {
    const activeExam = this.getActiveExam(userId, examId)
    if (!activeExam) {
      return undefined
    }

    const elapsed = DateTime.now().diff(activeExam.startTime, 'seconds').seconds
    const remaining = activeExam.duration - elapsed

    return {
      elapsedInSecondes: Math.floor(elapsed),
      remainingInSecondes: Math.max(0, Math.floor(remaining)),
      durationInSecondes: activeExam.duration,
    }
  }

  /**
   * Nettoie tous les timers (pour le shutdown)
   */
  cleanup() {
    console.log(`[ExamTimer] Nettoyage de ${this.activeExams.size} examens actifs`)
    for (const [key] of this.activeExams.entries()) {
      this.stopTimer(key)
    }
    this.activeExams.clear()
  }
}

export default ExamService.getInstance()
