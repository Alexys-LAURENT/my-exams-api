import ClientAccessibleException from '#exceptions/client_accessible_exception'
import UnauthorizedException from '#exceptions/un_authorized_exception'
import Answer from '#models/answer'
import Class from '#models/class'
import Evaluation from '#models/evaluation'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import Question from '#models/question'
import UserResponse from '#models/user_response'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import AbstractController from '../abstract_controller.js'
import {
  createExamValidator,
  examDateValidator,
  getExamsOfClassQueryValidator,
  idClassAndIdExamWithExistsValidator,
  idStudentAndIdExamWithExistsValidator,
  onlyIdClassWithExistsValidator,
  onlyIdExamWithExistsValidator,
  onlyIdTeacherWithExistsValidator,
} from './validator.js'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }

  public async getExamsOfClass({ params, request, auth }: HttpContext) {
    const validParams = await onlyIdClassWithExistsValidator.validate(params)

    const theClass = await Class.findOrFail(validParams.idClass)

    const validQuery = await getExamsOfClassQueryValidator.validate(request.qs())

    const { status, limit } = validQuery

    let examsQuery = theClass.related('exams').query().pivotColumns(['start_date', 'end_date'])

    const user = await auth.authenticate()

    const userId = user.idUser

    const today = DateTime.now().toSQL()

    if (status && userId) {
      if (status === 'completed') {
        examsQuery.whereExists((query) => {
          query
            .from('exam_grades')
            .whereRaw('exam_grades.id_exam = exams.id_exam')
            .where('exam_grades.id_user', userId)
        })
      } else if (status === 'pending') {
        examsQuery
          .wherePivot('start_date', '<=', today)
          .wherePivot('end_date', '>=', today)
          .whereNotExists((query) => {
            query
              .from('exam_grades')
              .whereRaw('exam_grades.id_exam = exams.id_exam')
              .where('exam_grades.id_user', userId)
          })
      } else if (status === 'comming') {
        examsQuery.wherePivot('start_date', '>', today).whereNotExists((query) => {
          query
            .from('exam_grades')
            .whereRaw('exam_grades.id_exam = exams.id_exam')
            .where('exam_grades.id_user', userId)
        })
      }
    }

    if (limit !== null) {
      examsQuery.limit(limit)
    }

    const exams = await examsQuery

    const serializedExams = exams.map((exam) => {
      return {
        ...exam.toJSON(),

        start_date: exam.$extras.pivot_start_date,
        end_date: exam.$extras.pivot_end_date,
      }
    })

    return this.buildJSONResponse({ data: serializedExams })
  }

  async putExamsForClass({ params, request, auth }: HttpContext) {
    const user = auth.user
    if (user?.accountType !== 'teacher' && user?.accountType !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les professeurs peuvent ajouter des examens aux classes'
      )
    }

    const validatedParams = await idClassAndIdExamWithExistsValidator.validate(params)

    const { idClass, idExam } = validatedParams

    const classInstance = await Class.findOrFail(idClass)

    const exam = await Exam.findOrFail(idExam)
    if (exam.idTeacher !== user?.idUser) {
      throw new UnauthorizedException('Vous ne pouvez ajouter que vos propres examens aux classes')
    }

    const bodyData = await examDateValidator.validate(request.body())

    const startDate = bodyData.start_date.toISOString()
    const endDate = bodyData.end_date.toISOString()

    // Ajouter l'examen à la classe avec les dates dans la table pivot
    await classInstance.related('exams').attach({
      [idExam]: {
        start_date: startDate,
        end_date: endDate,
      },
    })

    return this.buildJSONResponse({
      message: 'Examen ajouté à la classe avec succès',
    })
  }

  public async createExam({ request }: HttpContext) {
    const content = await createExamValidator.validate(request.body())
    const exam = await Exam.create({
      title: content.title,
      desc: content.desc,
      time: content.time,
      imagePath: content.imagePath ?? null,
      idTeacher: content.idTeacher,
    })
    return this.buildJSONResponse({ data: exam })
  }

  public async getOneExam({ params }: HttpContext) {
    const valid = await onlyIdExamWithExistsValidator.validate(params)
    const theExam = await Exam.findOrFail(valid.idExam)
    return this.buildJSONResponse({
      data: theExam,
    })
  }

  public async getAllExamsForOneTeacher({ params }: HttpContext) {
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const exams = await Exam.query().where('id_teacher', valid.idTeacher)
    return this.buildJSONResponse({ data: exams })
  }

  public async deleteExamFromClass({ params, auth }: HttpContext) {
    const user = auth.user
    if (!user || (user.accountType !== 'teacher' && user.accountType !== 'admin')) {
      throw new UnauthorizedException(
        "Seuls les professeurs et administrateurs peuvent désassocier un examen d'une classe"
      )
    }
    const validatedParams = await idClassAndIdExamWithExistsValidator.validate(params)
    const { idClass, idExam } = validatedParams
    const classInstance = await Class.findOrFail(idClass)

    if (user.accountType === 'teacher') {
      const exam = await Exam.findOrFail(idExam)
      if (exam.idTeacher !== user.idUser) {
        throw new UnauthorizedException('Vous ne pouvez désassocier que vos propres examens')
      }
    }

    await classInstance.related('exams').detach([idExam])

    return this.buildJSONResponse({ message: 'Examen désassocié de la classe avec succès' })
  }

  public async startExam({ params, auth }: HttpContext) {
    const user = await auth.authenticate()

    if (user.accountType !== 'student') {
      throw new UnauthorizedException('Only students can start an exam')
    }

    const valid = await onlyIdExamWithExistsValidator.validate(params)

    // On récupère la classe actuelle de l'étudiant
    const currentUserClass = await user
      .related('studentClasses')
      .query()
      .where('classes.start_date', '<=', DateTime.now().toSQL())
      .where('classes.end_date', '>=', DateTime.now().toSQL())
      .firstOrFail()

    // On vérifie que l'examen est bien lié à la classe de l'étudiant et que la période de réalisation est valide
    const exam = await Exam.query()
      .where('id_exam', valid.idExam)
      .andWhereHas('classes', (query) => {
        query
          .where('exams_classes.id_class', currentUserClass.idClass)
          .where('exams_classes.start_date', '<=', DateTime.now().toSQL())
          .andWhere((q) => {
            q.where('exams_classes.end_date', '>=', DateTime.now().toSQL())
          })
      })
      .first()

    if (!exam) {
      throw new ClientAccessibleException(
        'Exam not found or not available for your class at this time'
      )
    }

    await ExamGrade.create({
      idExam: exam.idExam,
      idUser: user.idUser,
      status: 'en cours',
      note: undefined,
    })

    return this.buildJSONResponse({ message: 'Exam started' })
  }

  public async stopExam({ params, auth }: HttpContext) {
    const user = await auth.authenticate()

    if (user.accountType !== 'student') {
      throw new UnauthorizedException('Only students can stop an exam')
    }

    const valid = await onlyIdExamWithExistsValidator.validate(params)

    // Récupérer l'examen et vérifier l'ExamGrade en cours
    const [exam, pendingExamGrade] = await Promise.all([
      Exam.findOrFail(valid.idExam),
      ExamGrade.query()
        .where('id_exam', valid.idExam)
        .andWhere('id_user', user.idUser)
        .andWhere('status', 'en cours')
        .first(),
    ])

    if (!pendingExamGrade) {
      throw new ClientAccessibleException("You don't have any pending exam of this type")
    }

    // Récupérer toutes les données nécessaires en une seule fois
    const [questionsOfExam, userResponses, allAnswers] = await Promise.all([
      Question.query().where('id_exam', valid.idExam),
      UserResponse.query().where('id_exam', valid.idExam).andWhere('id_user', user.idUser),
      Answer.query().where('id_exam', valid.idExam),
    ])

    // Créer les réponses manquantes si nécessaire
    const questionsWithoutResponse = questionsOfExam.filter((question) => {
      return !userResponses.some((response) => response.idQuestion === question.idQuestion)
    })

    if (questionsWithoutResponse.length > 0) {
      const newUserResponses = await UserResponse.createMany(
        questionsWithoutResponse.map((question) => ({
          idUser: user.idUser,
          idExam: valid.idExam,
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
        // Filtrer les réponses pour cette question spécifique
        const questionAnswers = allAnswers.filter(
          (answer) => answer.idQuestion === question.idQuestion
        )
        const correctAnswers = questionAnswers.filter((answer) => answer.isCorrect)

        // Trouver la réponse utilisateur pour cette question
        const userResponse = userResponses.find(
          (response) => response.idQuestion === question.idQuestion
        )
        if (!userResponse) continue

        // Réponses sélectionnées par l'utilisateur pour cette question
        const userSelectedAnswers = userResponsesAnswers.filter(
          (ura) => ura.id_user_response === userResponse.idUserResponse
        )

        let questionScore = 0

        if (question.isMultiple) {
          // Question à choix multiples : toutes les bonnes réponses ET aucune mauvaise
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
          // Question à choix unique : exactement une réponse et elle doit être correcte
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

        // Préparer l'évaluation à créer
        evaluationsToCreate.push({
          note: questionScore,
          id_student: user.idUser,
          id_teacher: exam.idTeacher, // Utilisation de l'idTeacher de l'examen
          id_user_response: userResponse.idUserResponse,
          created_at: DateTime.now().toSQL(),
          updated_at: DateTime.now().toSQL(),
        })

        totalScore += questionScore
      } else {
        // Question non QCM : correction manuelle requise
        allQuestionsAreCorrectable = false
      }
    }

    // Créer toutes les évaluations en une seule requête
    if (evaluationsToCreate.length > 0) {
      await db.table('evaluations').multiInsert(evaluationsToCreate)
    }

    // Mettre à jour l'ExamGrade selon le statut
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

    return this.buildJSONResponse({
      message: 'Exam stopped successfully',
      data: {
        status: allQuestionsAreCorrectable ? 'corrigé' : 'à corrigé',
        ...(allQuestionsAreCorrectable && { score: totalScore }),
      },
    })
  }

  public async recap({ params, auth }: HttpContext) {
    const valid = await idStudentAndIdExamWithExistsValidator.validate(params)
    const loggedUser = await auth.authenticate()

    if (loggedUser.accountType === 'student' && loggedUser.idUser !== valid.idStudent) {
      throw new UnauthorizedException('Students can only access their own exam recaps')
    }

    // The exam
    const exam = await Exam.findOrFail(valid.idExam)

    if (loggedUser.accountType === 'teacher' && exam.idTeacher !== loggedUser.idUser) {
      throw new UnauthorizedException('Teachers can only access recaps of their own exams')
    }

    const examGrade = await ExamGrade.query()
      .where('id_user', valid.idStudent)
      .andWhere('id_exam', valid.idExam)
      .andWhereNot('status', 'en cours')
      .first()

    if (!examGrade) {
      throw new ClientAccessibleException("You don't have any completed exam of this type")
    }

    // The questions of the exam
    const questions = await Question.query().where('id_exam', valid.idExam)
    // The answers of exma's questions that are `is_qcm`
    const answers = await Answer.query().where('id_exam', valid.idExam)
    // The user responses of the student for this exam
    const userResponses = await UserResponse.query()
      .where('id_user', valid.idStudent)
      .andWhere('id_exam', valid.idExam)
    // The user responses answers for questions that are `is_qcm`
    const userResponsesAnswers = (await db
      .query()
      .from('user_responses_answers')
      .whereIn(
        'id_user_response',
        userResponses.map((response) => response.idUserResponse)
      )) as { id_user_response: number; id_answer: number; id_question: number; id_exam: number }[]
    // The evaluations for the user responses
    const evaluations = await Evaluation.query()
      .whereIn(
        'id_user_response',
        userResponses.map((ur) => ur.idUserResponse)
      )
      .andWhere('id_student', valid.idStudent)

    const recap = {
      ...exam.toJSON(),
      quetions: questions.map((question) => {
        const questionAnswers = answers.filter(
          (answer) => answer.idQuestion === question.idQuestion
        )
        const correctAnswers = questionAnswers.filter((answer) => answer.isCorrect)
        const userResponse = userResponses.find((ur) => ur.idQuestion === question.idQuestion)
        const userSelectedAnswers = userResponsesAnswers.filter(
          (ura) => ura.id_user_response === userResponse?.idUserResponse
        )
        const evaluation = evaluations.find(
          (ev) => ev.idUserResponse === userResponse?.idUserResponse
        )
        return {
          ...question.toJSON(),
          answers: questionAnswers,
          correctAnswers,
          userResponse: {
            ...userResponse?.toJSON(),
            selectedAnswers: userSelectedAnswers,
          },
          evaluation: evaluation ? evaluation.toJSON() : null,
        }
      }),
      examGrade: examGrade.toJSON(),
    }

    return this.buildJSONResponse({ data: recap })
  }
}
