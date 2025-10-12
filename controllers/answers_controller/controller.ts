import Answer from '#models/answer'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import {
  createAnswerValidator,
  onlyIdQuestionWithExistsValidator,
  onlyIdExamWithExistsValidator,
} from './validator.js'
import { DateTime } from 'luxon'

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
      updatedAt: DateTime.now(),
    })
    return this.buildJSONResponse({ data: answer })
  }
}
