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

  public async createAnswers({ request }: HttpContext) {
    const content = await createAnswerValidator.validate(request.body())
    const validQuestion = await onlyIdQuestionWithExistsValidator.validate({
      idQuestion: content.idQuestion,
    })
    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: content.idExam })
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
