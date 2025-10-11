import Exam from '#models/exam'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { createExamValidator, onlyIdTeacherWithExistsValidator } from './validator.js'
import { DateTime } from 'luxon'

export default class ExamController extends AbstractController {
  constructor() {
    super()
  }

  public async createExam({ request }: HttpContext) {
    const content = await createExamValidator.validate(request.body())
    const validTeacher = await onlyIdTeacherWithExistsValidator.validate({
      idTeacher: content.idTeacher,
    })
    const exam = await Exam.create({
      title: content.title,
      desc: content.desc,
      time: content.time,
      imagePath: content.imagePath ?? null,
      idTeacher: validTeacher.idTeacher,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    })
    return this.buildJSONResponse({ data: exam })
  }
}
