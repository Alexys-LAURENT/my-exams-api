import UserResponse from '#models/user_response'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { createUsersResponseValidator, checkCustomOrNotValidator } from './validator.js'
import { DateTime } from 'luxon'
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
    let responses
    if (checkedAnswers.custom != null) {
      responses = await UserResponse.create({
        custom: checkedAnswers.custom,
        idUser: content.idUser,
        idQuestion: content.idQuestion,
        idExam: content.idExam,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      })
    } else if (checkedAnswers.answers != null) {
      let user_responses = await UserResponse.create({
        custom: checkedAnswers.custom,
        idUser: content.idUser,
        idQuestion: content.idQuestion,
        idExam: content.idExam,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      })
      const answerIds: number[] = Array.isArray(checkedAnswers.answers)
        ? checkedAnswers.answers.map((id) => Number(id))
        : [Number(checkedAnswers.answers)]
      const rows = answerIds.map((idAnswer) => ({
        id_answer: idAnswer,
        id_user_response: user_responses.idUserResponse,
        id_question: content.idQuestion,
        id_exam: content.idExam,
      }))
      responses = user_responses
      await db.table('user_responses_answers').insert(rows)
    }
    const usersResponse = responses
    return this.buildJSONResponse({ data: usersResponse })
  }
}
