import UnAuthorizedException from '#exceptions/un_authorized_exception'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import {
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
}
