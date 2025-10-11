import Question from '#models/question'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdExamWithExistsValidator, createQuestionValidator } from './validator.js'
import { DateTime } from 'luxon'

export default class QuestionsController extends AbstractController {
  constructor() {
    super()
  }

  public async getQuestionsCountForOneExam({ params }: HttpContext) {
    const valid = await onlyIdExamWithExistsValidator.validate(params)
    const questionsCount = await Question.query().where('id_exam', valid.idExam).count('* as total')
    return this.buildJSONResponse({ data: questionsCount[0].$extras.total })
  }

  public async createQuestion({ request }: HttpContext) {
    const content = await createQuestionValidator.validate(request.body())
    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: content.idExam })
    const question = await Question.create({
      idQuestion: content.idQuestion,
      title: content.title,
      commentary: content.commentary ?? null,
      isMultiple: content.isMultiple,
      isQcm: content.isQcm,
      maxPoints: content.maxPoints,
      idExam: validExam.idExam,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    })
    return this.buildJSONResponse({ data: question })
  }
}
