// import UnAuthorizedException from '#exceptions/un_authorized_exception'
// import ExamGrade from '#models/exam_grade'
import Question from '#models/question'
// import UserResponse from '#models/user_response'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AbstractController from '../abstract_controller.js'
import { createQuestionValidator, onlyIdExamWithExistsValidator } from './validator.js'

export default class QuestionsController extends AbstractController {
  constructor() {
    super()
  }

  // public async getQuestionsByIdForOneExam({ params, auth }: HttpContext) {
  //   const user = await auth.authenticate()
  //   const validExam = await onlyIdExamWithExistsValidator.validate(params)
  //   const validQuestion = await onlyIdQuestionWithExistsValidator.validate(params, {
  //     meta: { idExam: validExam.idExam },
  //   })

  //   if (user.accountType === 'student') {
  //     // Check if the student has an ongoing exam grade for this exam
  //     const examGrade = await ExamGrade.query()
  //       .where('id_user', user.idUser)
  //       .andWhere('id_exam', validExam.idExam)
  //       .andWhere('status', 'en cours')
  //       .first()

  //     if (!examGrade) {
  //       throw new UnAuthorizedException("You don't have any right to access to this question.")
  //     }

  //     // If the question is not the first one, check if the student has answered the previous question
  //     if (validQuestion.idQuestion > 1) {
  //       const previousUserReponse = await UserResponse.query()
  //         .where('id_user', user.idUser)
  //         .andWhere('id_exam', validExam.idExam)
  //         .andWhere('id_question', validQuestion.idQuestion - 1)
  //         .first()
  //       if (!previousUserReponse) {
  //         throw new UnAuthorizedException("You don't have any right to access to this question.")
  //       }
  //     }
  //   }

  //   const question = await Question.query()
  //     .where('id_question', validQuestion.idQuestion)
  //     .andWhere('id_exam', validExam.idExam)
  //     .firstOrFail()
  //   return this.buildJSONResponse({ data: question })
  // }

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
