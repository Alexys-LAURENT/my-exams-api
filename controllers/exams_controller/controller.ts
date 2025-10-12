import Exam from '#models/exam'
import User from '#models/user'
import Answer from '#models/answer'
import Question from '#models/question'
import UserResponse from '#models/user_response'
import ExamGrade from '#models/exam_grade'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import {
  onlyIdExamWithExistsValidator,
  onlyIdTeacherWithExistsValidator,
  onlyIdStudentWithExistsValidator,
} from './validator.js'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
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

  public async getExamRecapForOneStudent({ params }: HttpContext) {
    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: params.idExam })
    const validStudent = await onlyIdStudentWithExistsValidator.validate({
      idStudent: params.idStudent,
    })
    const exam = await Exam.findOrFail(validExam.idExam)
    const questions = await Question.query().where('id_exam', validExam.idExam)
    const answers = await Answer.query().where('id_exam', validExam.idExam)
    const userResponses = await UserResponse.query()
      .where('id_exam', validExam.idExam)
      .andWhere('id_user', validStudent.idStudent)
    const examGrade = await ExamGrade.query()
      .where('id_exam', validExam.idExam)
      .andWhere('id_user', validStudent.idStudent)
      .first()
    return this.buildJSONResponse({ data: { exam, questions, answers, userResponses, examGrade } })
  }
}
