import UnAuthorizedException from '#exceptions/un_authorized_exception'
import Answer from '#models/answer'
import Exam from '#models/exam'
import Question from '#models/question'
import ExamAuthorizationService from '#services/exam_authorization_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AbstractController from '../abstract_controller.js'
import {
  createQuestionValidator,
  onlyIdExamWithExistsValidator,
  onlyIdQuestionWithExistsValidator,
  updateQuestionValidator,
} from './validator.js'

export default class QuestionsController extends AbstractController {
  constructor() {
    super()
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

  public async getAllQuestionsForOneExam({ params, auth }: HttpContext) {
    const loggedUser = await auth.authenticate()

    if (loggedUser.accountType === 'student') {
      throw new UnAuthorizedException("Vous n'êtes pas autorisé à voir ces questions.")
    }

    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: params.idExam })

    const exam = await Exam.findOrFail(validExam.idExam)
    if (exam.idTeacher !== loggedUser.idUser && loggedUser.accountType === 'teacher') {
      throw new UnAuthorizedException("Vous n'êtes pas autorisé à voir ces questions.")
    }

    const questions = await Question.query().where('id_exam', validExam.idExam)
    return this.buildJSONResponse({ data: questions })
  }

  @inject()
  public async updateQuestion(
    { params, request, auth }: HttpContext,
    examAuthService: ExamAuthorizationService
  ) {
    const user = await auth.authenticate()
    if (user.accountType !== 'teacher') {
      throw new UnAuthorizedException('Seuls les enseignants peuvent modifier une question')
    }

    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: params.idExam })
    const validQuestion = await onlyIdQuestionWithExistsValidator.validate(
      { idQuestion: params.idQuestion },
      { meta: { idExam: validExam.idExam } }
    )

    // Check if exam can be modified
    await examAuthService.checkExamModifiable(validExam.idExam, user.idUser)

    const content = await updateQuestionValidator.validate(request.body())

    // Find the question using composite key (idQuestion + idExam)
    const question = await Question.query()
      .where('id_question', validQuestion.idQuestion)
      .where('id_exam', validExam.idExam)
      .firstOrFail()

    // Update fields if provided
    if (content.title !== undefined) question.title = content.title
    if (content.commentary !== undefined) question.commentary = content.commentary
    if (content.isMultiple !== undefined) question.isMultiple = content.isMultiple
    if (content.isQcm !== undefined) question.isQcm = content.isQcm
    if (content.maxPoints !== undefined) question.maxPoints = content.maxPoints

    await question.save()
    return this.buildJSONResponse({ data: question })
  }

  @inject()
  public async deleteQuestion(
    { params, auth }: HttpContext,
    examAuthService: ExamAuthorizationService
  ) {
    const user = await auth.authenticate()
    if (user.accountType !== 'teacher') {
      throw new UnAuthorizedException('Seuls les enseignants peuvent supprimer une question')
    }

    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: params.idExam })
    const validQuestion = await onlyIdQuestionWithExistsValidator.validate(
      { idQuestion: params.idQuestion },
      { meta: { idExam: validExam.idExam } }
    )

    // Check if exam can be modified
    await examAuthService.checkExamModifiable(validExam.idExam, user.idUser)

    // Find the question using composite key (idQuestion + idExam)
    const question = await Question.query()
      .where('id_question', validQuestion.idQuestion)
      .where('id_exam', validExam.idExam)
      .firstOrFail()

    // Delete associated answers first (using composite key: idQuestion + idExam)
    await Answer.query()
      .where('id_question', validQuestion.idQuestion)
      .where('id_exam', validExam.idExam)
      .delete()

    // Delete the question
    await question.delete()

    return this.buildJSONResponse({ message: 'Question supprimée avec succès' })
  }
}
