// import UnAuthorizedException from '#exceptions/un_authorized_exception'
import UnAuthorizedException from '#exceptions/un_authorized_exception'
import Answer from '#models/answer'
import Exam from '#models/exam'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AbstractController from '../abstract_controller.js'
import {
  createAnswerValidator,
  onlyIdExamWithExistsValidator,
  onlyIdQuestionWithExistsValidator,
} from './validator.js'

export default class AnswersController extends AbstractController {
  constructor() {
    super()
  }

  public async createAnswers({ params, request }: HttpContext) {
    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: params.idExam })
    const validQuestion = await onlyIdQuestionWithExistsValidator.validate(
      {
        idQuestion: params.idQuestion,
      },
      { meta: { idExam: validExam.idExam } }
    )
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

  public async getAllAnswersForOneQuestionOfOneExam({ params, auth }: HttpContext) {
    const loggedUser = await auth.authenticate()

    if (loggedUser.accountType === 'student') {
      throw new UnAuthorizedException("Vous n'êtes pas autorisé à voir ces questions.")
    }

    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: params.idExam })
    const validQuestion = await onlyIdQuestionWithExistsValidator.validate(
      {
        idQuestion: params.idQuestion,
      },
      { meta: { idExam: validExam.idExam } }
    )

    const exam = await Exam.findOrFail(validExam.idExam)
    if (exam.idTeacher !== loggedUser.idUser && loggedUser.accountType === 'teacher') {
      throw new UnAuthorizedException("Vous n'êtes pas autorisé à voir ces questions.")
    }

    const answers = await Answer.query()
      .where('idQuestion', validQuestion.idQuestion)
      .where('idExam', validExam.idExam)
    return this.buildJSONResponse({ data: answers })
  }
}
