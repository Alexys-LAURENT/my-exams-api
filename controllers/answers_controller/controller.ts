import Answer from '#models/answer'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AbstractController from '../abstract_controller.js'
import {
  createAnswerValidator,
  examQuestionParamsValidator,
  onlyIdExamWithExistsValidator,
  onlyIdQuestionWithExistsValidator,
} from './validator.js'

export default class AnswersController extends AbstractController {
  constructor() {
    super()
  }

  public async createAnswers({ params, request }: HttpContext) {
    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: params.idExam })
    const validQuestion = await onlyIdQuestionWithExistsValidator.validate({
      idQuestion: params.idQuestion,
    })
    const content = await createAnswerValidator.validate(request.body())
    const answer = await Answer.create({
      idAnswer: content.idAnswer,
      answer: content.answer,
      isCorrect: content.isCorrect,
      idQuestion: validQuestion.idQuestion,
      idExam: validExam.idExam,
      createdAt: DateTime.now(),
    })
    return this.buildJSONResponse({ data: answer })
  }

  public async getAnswersByQuestionsForExam({ params }: HttpContext) {
    const { idExam, idQuestion } = await examQuestionParamsValidator.validate(params)
    const answers = await Answer.query()
      .where('id_question', idQuestion)
      .andWhere('id_exam', idExam)
      .select(['id_answer', 'answer', 'created_at', 'updated_at'])
    return this.buildJSONResponse({ data: answers })
  }
}
