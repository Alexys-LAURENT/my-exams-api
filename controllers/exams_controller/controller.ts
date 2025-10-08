import Exam from '#models/exam'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdTeacherWithExistsValidator } from './validator.js'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }

  public async getAllExamsForOneTeacher({ params }: HttpContext) {
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const exams = await Exam.query().where('id_teacher', valid.idTeacher)
    return this.buildJSONResponse({ data: exams })
  }
}
