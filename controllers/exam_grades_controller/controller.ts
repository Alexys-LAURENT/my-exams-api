import ExamGrade from '#models/exam_grade'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { idStudentAndIdExamWithExistsValidator } from './validators.js'

export default class ExamGradesController extends AbstractController {
  constructor() {
    super()
  }

  public async getExamGradeForOneStudent({ params }: HttpContext) {
    const valid = await idStudentAndIdExamWithExistsValidator.validate(params)
    const examGrade = await ExamGrade.query()
      .where('id_user', valid.idStudent)
      .andWhere('id_exam', valid.idExam)
      .firstOrFail()
    return this.buildJSONResponse({ data: examGrade })
  }
}
