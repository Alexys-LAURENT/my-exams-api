import UserResponse from '#models/user_response'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import {
  createUsersResponseValidator,
  onlyIdExamWithExistsValidator,
  onlyIdQuestionWithExistsValidator,
  onlyIdStudentWithExistsValidator,
} from './validator.js'
import { DateTime } from 'luxon'

export default class UsersResponsesController extends AbstractController {
  constructor() {
    super()
  }
  public async createUsersResponse({ request }: HttpContext) {
    const content = await createUsersResponseValidator.validate(request.body())
    const validExam = await onlyIdExamWithExistsValidator.validate({ idExam: content.idExam })
    const validQuestion = await onlyIdQuestionWithExistsValidator.validate({
      idQuestion: content.idQuestion,
    })
    const validStudent = await onlyIdStudentWithExistsValidator.validate({ idUser: content.idUser })
    const usersResponse = await UserResponse.create({
      custom: content.custom,
      idUser: validStudent.idUser,
      idQuestion: validQuestion.idQuestion,
      idExam: validExam.idExam,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    })
    return this.buildJSONResponse({ data: usersResponse })
  }
}
