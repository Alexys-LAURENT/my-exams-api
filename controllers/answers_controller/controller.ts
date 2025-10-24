// import UnAuthorizedException from '#exceptions/un_authorized_exception'
import Answer from '#models/answer'
// import ExamGrade from '#models/exam_grade'
// import UserResponse from '#models/user_response'
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

  // public async getAnswersByQuestionsForExam({ params, auth }: HttpContext) {
  //   const user = await auth.authenticate()
  //   const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: params.idExam })
  //   const validQuestion = await onlyIdQuestionWithExistsValidator.validate(
  //     {
  //       idQuestion: params.idQuestion,
  //     },
  //     { meta: { idExam: validExam.idExam } }
  //   )

  //   if (user.accountType === 'student') {
  //     // Check if the student has an ongoing exam grade for this exam
  //     const examGrade = await ExamGrade.query()
  //       .where('id_user', user.idUser)
  //       .andWhere('id_exam', validExam.idExam)
  //       .andWhere('status', 'en cours')
  //       .first()

  //     if (!examGrade) {
  //       throw new UnAuthorizedException("You don't have any right to access to this answer.")
  //     }

  //     // If the question is not the first one, check if the student has answered the previous question
  //     if (validQuestion.idQuestion > 1) {
  //       const previousUserReponse = await UserResponse.query()
  //         .where('id_user', user.idUser)
  //         .andWhere('id_exam', validExam.idExam)
  //         .andWhere('id_question', validQuestion.idQuestion - 1)
  //         .first()
  //       if (!previousUserReponse) {
  //         throw new UnAuthorizedException("You don't have any right to access to this answer.")
  //       }
  //     }
  //   }

  //   const answers = await Answer.query()
  //     .where('id_question', validQuestion.idQuestion)
  //     .andWhere('id_exam', validExam.idExam)
  //     .select(['id_answer', 'answer', 'created_at', 'updated_at'])
  //   return this.buildJSONResponse({ data: answers })
  // }
}
