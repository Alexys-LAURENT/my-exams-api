import UnAuthorizedException from '#exceptions/un_authorized_exception'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import {
  getExamGradesForStudentValidator,
  idStudentAndIdClassWithExistsValidator,
  idStudentAndIdExamAndIdClassWithExistsValidator,
  onlyIdExamGradeWithExistsValidator,
  updateExamGradeValidator,
} from './validators.js'

export default class ExamGradesController extends AbstractController {
  constructor() {
    super()
  }

  public async getExamGradeForOneStudent({ params }: HttpContext) {
    const valid = await idStudentAndIdExamAndIdClassWithExistsValidator.validate(params)
    const examGrade = await ExamGrade.query()
      .where('id_user', valid.idStudent)
      .andWhere('id_exam', valid.idExam)
      .andWhere('id_class', valid.idClass)
      .firstOrFail()
    return this.buildJSONResponse({ data: examGrade })
  }

  public async updateExamGrade({ request, params, auth }: HttpContext) {
    const validExamGrade = await onlyIdExamGradeWithExistsValidator.validate(params)
    const user = await auth.authenticate()
    const examGrade = await ExamGrade.findOrFail(validExamGrade.idExamGrade)

    if (user.accountType !== 'teacher') {
      throw new UnAuthorizedException('Only teachers can update exam grades')
    }
    const concernedExam = await Exam.findOrFail(examGrade.idExam)

    if (concernedExam.idTeacher !== user.idUser) {
      throw new UnAuthorizedException('You are not the teacher of this exam')
    }

    const valid = await updateExamGradeValidator.validate(request.body())

    await examGrade
      .merge({
        ...valid,
      })
      .save()

    return this.buildJSONResponse({ data: examGrade })
  }

  /**
   * Récupère toutes les examGrades d'un étudiant pour une classe spécifique avec des options de filtrage
   *
   * Cette méthode permet de récupérer les notes d'examens d'un étudiant pour une classe donnée avec la possibilité
   * de limiter le nombre de résultats et de filtrer par statut (`in_progress`, `to_correct`, `corrected`).
   *
   * @route GET /api/exam_grades/classes/:idClass/student/:idStudent
   * @param {HttpContext} context - Le contexte HTTP contenant les paramètres et la query string
   * @returns {Promise<Object>} { data: ExamGrade[] } - Les examGrades filtrées
   */
  public async getExamGradesForStudentInOneClass({ params, request }: HttpContext) {
    const validParams = await idStudentAndIdClassWithExistsValidator.validate(params)
    const validQuery = await getExamGradesForStudentValidator.validate(request.qs())

    const query = ExamGrade.query()
      .where('id_user', validParams.idStudent)
      .andWhere('id_class', validParams.idClass)

    if (validQuery.status) {
      let statusForDb
      switch (validQuery.status) {
        case 'in_progress':
          statusForDb = 'en cours'
          break
        case 'to_correct':
          statusForDb = 'à corriger'
          break
        case 'corrected':
          statusForDb = 'corrigé'
          break
      }
      query.andWhere('status', statusForDb)
    }

    if (validQuery.limit) {
      query.limit(validQuery.limit)
    }

    const examGrades = await query

    return this.buildJSONResponse({ data: examGrades })
  }
}
