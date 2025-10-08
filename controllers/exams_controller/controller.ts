import Question from '#models/question'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { examQuestionParamsValidator } from './validator.js'

export default class TeachersController extends AbstractController {
  constructor() {
    super()
  }

  public async getQuestionsByIdForOneExam({ params }: HttpContext) {
    const { idExam, idQuestion } = await examQuestionParamsValidator.validate(params)
    const question = await Question.query()
      .where('id_question', idQuestion)
      .andWhere('id_exam', idExam)
      .firstOrFail()
    return this.buildJSONResponse({ data: question })
  }
}
