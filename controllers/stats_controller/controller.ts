import ClientAccessibleException from '#exceptions/client_accessible_exception'
import Class from '#models/class'
import ExamGrade from '#models/exam_grade'
import Question from '#models/question'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import AbstractController from '../abstract_controller.js'
import {
  idClassAndIdUserValidator,
  idClassValidator,
  idExamAndIdClassValidator,
  idExamValidator,
  idTeacherAndIdClassValidator,
} from './validator.js'

export default class StatsController extends AbstractController {
  constructor() {
    super()
  }

  /**
   * Calcule la moyenne générale d'un élève dans une classe spécifique
   *
   * Cette méthode permet d'obtenir la moyenne d'un étudiant en se basant sur tous les examens
   * qui ont été assignés à sa classe, peu importe le professeur qui les a créés.
   *
   * Étapes du calcul :
   * 1. Valide que l'utilisateur et la classe existent
   * 2. Vérifie que l'étudiant appartient bien à cette classe (via students_classes)
   * 3. Récupère tous les examens assignés à cette classe (via exams_classes)
   * 4. Filtre les notes de l'étudiant pour ces examens (status != 'en cours' et note != null)
   * 5. Calcule la moyenne arithmétique de toutes les notes obtenues
   *
   * @route GET /api/stats/classes/:idClass/users/:idUser/average
   * @param {HttpContext} context - Le contexte HTTP contenant les paramètres de la requête
   * @returns {Promise<Object>} { data: { average: number } } - Moyenne arrondie à 2 décimales, 0 si aucune note
   */
  public async getUserAverageInClass({ params, auth }: HttpContext) {
    const loggedUser = await auth.authenticate()
    const validParams = await idClassAndIdUserValidator.validate(params)
    const { idClass, idUser } = validParams

    if (loggedUser.accountType === 'student' && loggedUser.idUser !== idUser) {
      throw new ClientAccessibleException("Vous n'êtes pas autorisé à voir cette moyenne")
    }

    if (loggedUser.accountType === 'student') {
      // Vérifier que l'utilisateur appartient à cette classe
      const userInClass = await db
        .from('students_classes')
        .where('id_student', idUser)
        .andWhere('id_class', idClass)
        .first()

      if (!userInClass) {
        throw new ClientAccessibleException("L'utilisateur ne fait pas partie de cette classe")
      }
    }

    // Récupérer tous les examens associés à cette classe
    const examsOfClass = await db.from('exams_classes').select('id_exam').where('id_class', idClass)

    const examIds = examsOfClass.map((e) => e.id_exam)

    if (examIds.length === 0) {
      return this.buildJSONResponse({ data: { average: 0 } })
    }

    // Récupérer les notes de l'utilisateur pour ces examens
    // On exclut les examens 'en cours' et ceux sans note
    const examGrades = await ExamGrade.query()
      .where('id_user', idUser)
      .andWhere('id_class', idClass)
      .whereIn('id_exam', examIds)
      .andWhereNot('status', 'en cours')
      .whereNotNull('note')

    if (examGrades.length === 0) {
      return this.buildJSONResponse({ data: { average: 0 } })
    }

    // Calcul de la moyenne : somme des notes / nombre de notes
    const total = examGrades.reduce((sum, grade) => sum + (grade.note || 0), 0)
    const average = total / examGrades.length

    return this.buildJSONResponse({ data: { average: Math.round(average * 100) / 100 } })
  }

  /**
   * Calcule le taux de participation moyen de chaque élève d'une classe aux examens d'un professeur
   *
   * Cette méthode permet à un professeur de voir le taux de participation de tous les élèves
   * d'une classe spécifique pour les examens qu'il leur a donnés.
   *
   * Étapes du calcul :
   * 1. Valide que le professeur et la classe existent
   * 2. Récupère tous les examens créés par ce professeur et assignés à cette classe
   * 3. Récupère tous les étudiants de cette classe
   * 4. Pour chaque étudiant, compte combien d'examens il a complétés (status != 'en cours')
   * 5. Calcule le pourcentage : (examens complétés / examens totaux) * 100
   *
   * @route GET /api/stats/teachers/:idTeacher/classes/:idClass/average_participation_rate
   * @param {HttpContext} context - Le contexte HTTP contenant les paramètres de la requête
   * @returns {Promise<Object>} { data: [{ idUser: number, average_participation_rate: number }] }
   */
  public async getAverageParticipationRate({ params }: HttpContext) {
    const validParams = await idTeacherAndIdClassValidator.validate(params)
    const { idTeacher, idClass } = validParams

    // Récupérer les examens donnés par ce professeur pour cette classe
    // JOIN entre exams_classes et exams pour filtrer par professeur
    const examsOfTeacherForClass = await db
      .from('exams_classes')
      .innerJoin('exams', 'exams_classes.id_exam', 'exams.id_exam')
      .where('exams.id_teacher', idTeacher)
      .andWhere('exams_classes.id_class', idClass)
      .select('exams.id_exam')

    const examIds = examsOfTeacherForClass.map((e) => e.id_exam)

    if (examIds.length === 0) {
      return this.buildJSONResponse({ data: [] })
    }

    // Récupérer tous les étudiants de cette classe
    const students = await db
      .from('students_classes')
      .where('id_class', idClass)
      .select('id_student')

    const studentIds = students.map((s) => s.id_student)

    if (studentIds.length === 0) {
      return this.buildJSONResponse({ data: [] })
    }

    // Calculer le taux de participation pour chaque étudiant
    const results = []

    for (const studentId of studentIds) {
      // Compter les examens complétés par cet étudiant
      const completedExams = await ExamGrade.query()
        .where('id_user', studentId)
        .andWhere('id_class', idClass)
        .whereIn('id_exam', examIds)
        .andWhereNot('status', 'en cours')

      // Calcul du taux : (examens terminés / examens totaux) * 100
      const participationRate =
        examIds.length > 0 ? (completedExams.length / examIds.length) * 100 : 0

      results.push({
        idUser: studentId,
        average_participation_rate: Math.round(participationRate * 100) / 100,
      })
    }

    return this.buildJSONResponse({ data: results })
  }

  /**
   * Calcule la moyenne générale d'une classe pour un examen spécifique
   *
   * Cette méthode permet d'obtenir la moyenne obtenue par tous les élèves d'une classe
   * pour un examen donné. Utile pour évaluer la difficulté d'un examen ou la performance globale.
   *
   * Étapes du calcul :
   * 1. Valide que l'examen et la classe existent
   * 2. Vérifie que l'examen est bien associé à cette classe (via exams_classes)
   * 3. Récupère toutes les notes des élèves de cette classe pour cet examen
   * 4. Calcule la moyenne arithmétique de toutes ces notes
   *
   * @route GET /api/stats/exams/:idExam/classes/:idClass/average
   * @param {HttpContext} context - Le contexte HTTP contenant les paramètres de la requête
   * @returns {Promise<Object>} { data: { average: number } } - Moyenne de la classe pour cet examen
   */
  public async getClassAverageForExam({ params }: HttpContext) {
    const validParams = await idExamAndIdClassValidator.validate(params)
    const { idExam, idClass } = validParams

    // Vérifier que l'examen est associé à cette classe
    const examClassRelation = await db
      .from('exams_classes')
      .where('id_exam', idExam)
      .andWhere('id_class', idClass)
      .first()

    if (!examClassRelation) {
      throw new ClientAccessibleException("Cet examen n'est pas associé à cette classe")
    }

    // Récupérer toutes les notes pour cet examen et cette classe
    const examGrades = await ExamGrade.query()
      .where('id_exam', idExam)
      .andWhere('id_class', idClass)
      .andWhereNot('status', 'en cours')
      .whereNotNull('note')

    if (examGrades.length === 0) {
      return this.buildJSONResponse({ data: { average: 0 } })
    }

    // Calcul de la moyenne de classe
    const total = examGrades.reduce((sum, grade) => sum + (grade.note || 0), 0)
    const average = total / examGrades.length

    return this.buildJSONResponse({ data: { average: Math.round(average * 100) / 100 } })
  }

  /**
   * Identifie les 5 questions les plus échouées d'un examen
   *
   * Cette méthode analyse les résultats d'un examen pour identifier les questions qui posent
   * le plus de difficultés aux étudiants. Le taux d'échec est calculé en considérant qu'une
   * question est échouée si la note obtenue est inférieure à la moitié des points maximum.
   *
   * Étapes du calcul :
   * 1. Valide que l'examen existe
   * 2. Récupère toutes les questions de l'examen
   * 3. Pour chaque question :
   *    - Récupère toutes les évaluations des réponses utilisateur
   *    - Compte combien ont une note < maxPoints/2 (seuil d'échec)
   *    - Calcule le pourcentage : (échecs / tentatives totales) * 100
   * 4. Trie par taux d'échec décroissant et retourne le top 5
   *
   * @route GET /api/stats/exams/:idExam/most_failed_questions
   * @param {HttpContext} context - Le contexte HTTP contenant les paramètres de la requête
   * @returns {Promise<Object>} { data: [{ idQuestion: number, fail_rate: number }] } - Top 5 max
   */
  public async getMostFailedQuestions({ params }: HttpContext) {
    const validParams = await idExamValidator.validate(params)
    const { idExam } = validParams

    // Récupérer toutes les questions de l'examen
    const questions = await Question.query().where('id_exam', idExam)

    if (questions.length === 0) {
      return this.buildJSONResponse({ data: [] })
    }

    const questionStats = []

    for (const question of questions) {
      // Récupérer toutes les évaluations pour cette question
      // JOIN entre evaluations et user_responses pour lier les notes aux questions
      const evaluations = await db
        .from('evaluations')
        .innerJoin(
          'user_responses',
          'evaluations.id_user_response',
          'user_responses.id_user_response'
        )
        .where('user_responses.id_question', question.idQuestion)
        .andWhere('user_responses.id_exam', idExam)
        .whereNotNull('evaluations.note')
        .select('evaluations.note', 'user_responses.id_question')

      if (evaluations.length === 0) continue

      // Calculer le taux d'échec (note < maxPoints / 2)
      // Exemple : si maxPoints = 10, une note < 5 est considérée comme un échec
      const threshold = question.maxPoints / 2
      const failedCount = evaluations.filter((e) => e.note < threshold).length
      const failRate = (failedCount / evaluations.length) * 100

      questionStats.push({
        idQuestion: question.idQuestion,
        fail_rate: Math.round(failRate * 100) / 100,
      })
    }

    // Trier par taux d'échec décroissant et prendre les 5 premiers
    const topFailed = questionStats.sort((a, b) => b.fail_rate - a.fail_rate).slice(0, 5)

    return this.buildJSONResponse({ data: topFailed })
  }

  /**
   * Calcule la moyenne générale d'une classe sur tous les examens (endpoint admin)
   *
   * Cette méthode permet aux administrateurs d'obtenir la moyenne globale d'une classe
   * en prenant en compte tous les examens qui lui ont été assignés, peu importe le professeur.
   * Utile pour évaluer la performance générale d'une classe.
   *
   * Étapes du calcul :
   * 1. Valide que la classe existe
   * 2. Récupère tous les examens assignés à cette classe (tous profs confondus)
   * 3. Récupère toutes les notes de tous les élèves pour ces examens
   * 4. Calcule la moyenne arithmétique globale
   *
   * @route GET /api/stats/classes/:idClass/average
   * @param {HttpContext} context - Le contexte HTTP contenant les paramètres de la requête
   * @returns {Promise<Object>} { data: { idClass: number, average: number } }
   */
  public async getClassGeneralAverage({ params }: HttpContext) {
    const validParams = await idClassValidator.validate(params)
    const { idClass } = validParams

    // Vérifier que la classe existe
    await Class.findOrFail(idClass)

    // Récupérer tous les examens associés à cette classe
    const examsOfClass = await db.from('exams_classes').select('id_exam').where('id_class', idClass)

    const examIds = examsOfClass.map((e) => e.id_exam)

    if (examIds.length === 0) {
      return this.buildJSONResponse({ data: { idClass, average: 0 } })
    }

    // Récupérer toutes les notes pour ces examens et cette classe
    // Cela inclut toutes les notes de tous les élèves pour tous les examens
    const examGrades = await ExamGrade.query()
      .where('id_class', idClass)
      .whereIn('id_exam', examIds)
      .andWhereNot('status', 'en cours')
      .whereNotNull('note')

    if (examGrades.length === 0) {
      return this.buildJSONResponse({ data: { idClass, average: 0 } })
    }

    // Calcul de la moyenne générale de la classe
    const total = examGrades.reduce((sum, grade) => sum + (grade.note || 0), 0)
    const average = total / examGrades.length

    return this.buildJSONResponse({ data: { idClass, average: Math.round(average * 100) / 100 } })
  }
}
