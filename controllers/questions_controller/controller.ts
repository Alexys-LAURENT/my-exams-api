import Question from '#models/question'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AbstractController from '../abstract_controller.js'
import {
  createQuestionValidator,
  onlyIdExamWithExistsValidator,
  onlyIdQuestionWithExistsValidator,
} from './validator.js'

export default class QuestionsController extends AbstractController {
  constructor() {
    super()
  }

  public async getQuestionsByIdForOneExam({ params }: HttpContext) {
    const validExam = await onlyIdExamWithExistsValidator.validate(params)
    const validQuestion = await onlyIdQuestionWithExistsValidator.validate(params, {
      meta: { idExam: validExam.idExam },
    })
    const question = await Question.query()
      .where('id_question', validQuestion.idQuestion)
      .andWhere('id_exam', validExam.idExam)
      .firstOrFail()
    return this.buildJSONResponse({ data: question })
  }

  public async getQuestionsCountForOneExam({ params }: HttpContext) {
    const valid = await onlyIdExamWithExistsValidator.validate(params)
    const questionsCount = await Question.query().where('id_exam', valid.idExam).count('* as total')
    return this.buildJSONResponse({ data: questionsCount[0].$extras.total })
  }

  public async createQuestion({ params, request }: HttpContext) {
    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: params.idExam })
    const content = await createQuestionValidator.validate(request.body())
    const question = await Question.create({
      idQuestion: content.idQuestion,
      title: content.title,
      commentary: content.commentary ?? null,
      isMultiple: content.isMultiple,
      isQcm: content.isQcm,
      maxPoints: content.maxPoints,
      idExam: validExam.idExam,
      createdAt: DateTime.now(),
    })
    return this.buildJSONResponse({ data: question })
  }
}
