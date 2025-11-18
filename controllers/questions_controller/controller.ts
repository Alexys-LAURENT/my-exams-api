import UnAuthorizedException from '#exceptions/un_authorized_exception'
import Exam from '#models/exam'
import Question from '#models/question'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AbstractController from '../abstract_controller.js'
import { createQuestionValidator, onlyIdExamWithExistsValidator } from './validator.js'

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
}
