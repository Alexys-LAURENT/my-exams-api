import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { createTeacherValidator } from './validator.js'

export default class TeachersController extends AbstractController {
  constructor() {
    super()
  }

  public async createTeacher({ request }: HttpContext) {
    const content = await createTeacherValidator.validate(request.body())
    const teacher = await User.create({
      lastName: content.lastName,
      name: content.name,
      email: content.email,
      password: content.password,
      avatarPath: content.avatarPath ?? null,
      accountType: 'teacher',
    })
    return this.buildJSONResponse({ data: teacher })
  }
}
