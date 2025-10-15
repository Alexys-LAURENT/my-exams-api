import UserResponse from '#models/user_response'
import Question from '#models/question'
import ExamGrade from '#models/exam_grade'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { createUsersResponseValidator, checkCustomOrNotValidator } from './validator.js'
import db from '@adonisjs/lucid/services/db'
import ClientAccessibleException from '#exceptions/client_accessible_exception'
import UnauthorizedException from '#exceptions/un_authorized_exception'

export default class UsersResponsesController extends AbstractController {
  constructor() {
    super()
  }
  public async createUsersResponse({ auth, request }: HttpContext) {
    const content = await createUsersResponseValidator.validate(request.body())
    const user = await auth.authenticate()
    if (user.accountType !== 'student') {
      throw new UnauthorizedException()
    }
    const pendingExamGrade = await ExamGrade.query()
      .where('id_exam', content.idExam)
      .andWhere('id_user', user.idUser)
      .andWhere('status', 'en cours')
      .first()
    if (!pendingExamGrade) {
      throw new ClientAccessibleException("You don't have any pending exam of this type")
    }
    const checkedAnswers = await checkCustomOrNotValidator.validate(request.body(), {
      meta: { idExam: content.idExam, idQuestion: content.idQuestion },
    })

    if (checkedAnswers.answers != null && checkedAnswers.custom != null) {
      throw new Error('You can only send a custom answer or answers from the list, not both')
    }
    const usersResponse = await UserResponse.create({
      custom: checkedAnswers.custom ? checkedAnswers.custom : null,
      idUser: user.idUser,
      idQuestion: content.idQuestion,
      idExam: content.idExam,
    })
    if (checkedAnswers.answers != null) {
      const question = await Question.findOrFail(content.idQuestion)
      if (checkedAnswers.answers.length > 1 && !question.isQcm) {
        throw new Error('This question is not a QCM, you can only send a custom answer')
      }
      const rows = checkedAnswers.answers.map((idAnswer) => ({
        id_answer: idAnswer,
        id_user_response: usersResponse.idUserResponse,
        id_question: content.idQuestion,
        id_exam: content.idExam,
      }))
      await db.table('user_responses_answers').insert(rows)
    }
    return this.buildJSONResponse({ data: usersResponse })
  }
}
