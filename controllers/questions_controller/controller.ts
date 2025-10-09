import Question from '#models/question'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdExamWithExistsValidator } from './validator.js'

export default class QuestionsController extends AbstractController {
  constructor() {
    super()
  }

  public async getQuestionsCountForOneExam({ params }: HttpContext) {
    const valid = await onlyIdExamWithExistsValidator.validate(params)
    const questionsCount = await Question.query().where('id_exam', valid.idExam).count('* as total')
    return this.buildJSONResponse({ data: questionsCount[0].$extras.total })
  }
}
