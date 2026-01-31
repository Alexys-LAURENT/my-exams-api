import UnAuthorizedException from '#exceptions/un_authorized_exception'
import Answer from '#models/answer'
import Exam from '#models/exam'
import ExamAuthorizationService from '#services/exam_authorization_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AbstractController from '../abstract_controller.js'
import {
  createAnswerValidator,
  onlyIdAnswerWithExistsValidator,
  onlyIdExamWithExistsValidator,
  onlyIdQuestionWithExistsValidator,
  updateAnswerValidator,
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

  @inject()
  public async updateAnswer(
    { params, request, auth }: HttpContext,
    examAuthService: ExamAuthorizationService
  ) {
    const user = await auth.authenticate()
    if (user.accountType !== 'teacher') {
      throw new UnAuthorizedException('Seuls les enseignants peuvent modifier une réponse')
    }

    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: params.idExam })
    const validQuestion = await onlyIdQuestionWithExistsValidator.validate(
      { idQuestion: params.idQuestion },
      { meta: { idExam: validExam.idExam } }
    )
    const validAnswer = await onlyIdAnswerWithExistsValidator.validate(
      { idAnswer: params.idAnswer },
      { meta: { idExam: validExam.idExam, idQuestion: validQuestion.idQuestion } }
    )

    // Check if exam can be modified
    await examAuthService.checkExamModifiable(validExam.idExam, user.idUser)

    const content = await updateAnswerValidator.validate(request.body())

    // Find the answer using composite key (idAnswer + idQuestion + idExam)
    const answer = await Answer.query()
      .where('id_answer', validAnswer.idAnswer)
      .where('id_question', validQuestion.idQuestion)
      .where('id_exam', validExam.idExam)
      .firstOrFail()

    // Update fields if provided
    if (content.answer !== undefined) answer.answer = content.answer
    if (content.isCorrect !== undefined) answer.isCorrect = content.isCorrect

    await answer.save()
    return this.buildJSONResponse({ data: answer })
  }

  @inject()
  public async deleteAnswer(
    { params, auth }: HttpContext,
    examAuthService: ExamAuthorizationService
  ) {
    const user = await auth.authenticate()
    if (user.accountType !== 'teacher') {
      throw new UnAuthorizedException('Seuls les enseignants peuvent supprimer une réponse')
    }

    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: params.idExam })
    const validQuestion = await onlyIdQuestionWithExistsValidator.validate(
      { idQuestion: params.idQuestion },
      { meta: { idExam: validExam.idExam } }
    )
    const validAnswer = await onlyIdAnswerWithExistsValidator.validate(
      { idAnswer: params.idAnswer },
      { meta: { idExam: validExam.idExam, idQuestion: validQuestion.idQuestion } }
    )

    // Check if exam can be modified
    await examAuthService.checkExamModifiable(validExam.idExam, user.idUser)

    // Find and delete the answer using composite key (idAnswer + idQuestion + idExam)
    const answer = await Answer.query()
      .where('id_answer', validAnswer.idAnswer)
      .where('id_question', validQuestion.idQuestion)
      .where('id_exam', validExam.idExam)
      .firstOrFail()

    await answer.delete()

    return this.buildJSONResponse({ message: 'Réponse supprimée avec succès' })
  }
}
