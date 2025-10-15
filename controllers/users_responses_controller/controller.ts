import UserResponse from '#models/user_response'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { createUsersResponseValidator, checkCustomOrNotValidator } from './validator.js'
import db from '@adonisjs/lucid/services/db'

export default class UsersResponsesController extends AbstractController {
  constructor() {
    super()
  }
  public async createUsersResponse({ request }: HttpContext) {
    const content = await createUsersResponseValidator.validate(request.body())
    const checkedAnswers = await checkCustomOrNotValidator.validate(request.body(), {
      meta: { idExam: content.idExam, idQuestion: content.idQuestion },
    })
    if (checkedAnswers.answers != null && checkedAnswers.custom != null) {
      return this.buildJSONResponse({
        error: 'Vous ne pouvez pas envoyer à la fois "custom" et "answers".',
      })
    }
    const usersResponse = await UserResponse.create({
      custom: checkedAnswers.custom ? checkedAnswers.custom : null,
      idUser: content.idUser,
      idQuestion: content.idQuestion,
      idExam: content.idExam,
    })
    if (checkedAnswers.answers != null) {
      const answerIds: number[] = Array.isArray(checkedAnswers.answers)
        ? checkedAnswers.answers.map((id) => Number(id))
        : [Number(checkedAnswers.answers)]
      const rows = answerIds.map((idAnswer) => ({
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
