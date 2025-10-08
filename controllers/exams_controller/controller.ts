import Answer from '#models/answer'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { examQuestionParamsValidator } from './validator.js'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }

  public async getAnswersByQuestionsForExam({ params }: HttpContext) {
    const { idExam, idQuestion } = await examQuestionParamsValidator.validate(params)
    const answers = await Answer.query()
      .where('id_question', idQuestion)
      .andWhere('id_exam', idExam)
    return this.buildJSONResponse({ data: answers })
  }
}
