import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import {
  onlyIdTeacherWithExistsValidator,
  onlyIdStudentWithExistsValidator,
  onlyIdExamWithExistsValidator,
} from './validator.js'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }

  public async getAllExamsForOneTeacher({ params }: HttpContext) {
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const exams = await Exam.query().where('id_teacher', valid.idTeacher)
    return this.buildJSONResponse({ data: exams })
  }

  public async getExamGradeForOneStudent({ params }: HttpContext) {
    const validStudent = await onlyIdStudentWithExistsValidator.validate({
      idStudent: params.idStudent,
    })
    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: params.idExam })
    const examGrade = await ExamGrade.query()
      .where('id_user', validStudent.idStudent)
      .andWhere('id_exam', validExam.idExam)
      .firstOrFail()
    return this.buildJSONResponse({ data: examGrade })
  }
}
