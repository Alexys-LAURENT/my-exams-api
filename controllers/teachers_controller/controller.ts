import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { updateTeacherValidator, onlyIdTeacherWithExistsValidator } from './validator.js'

export default class TeachersController extends AbstractController {
  constructor() {
    super()
  }

  public async updateTeacher({ request, params }: HttpContext) {
    const content = await updateTeacherValidator.validate(request.body())
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const teacher = await User.findOrFail(valid.idTeacher)

    if (content.lastName) teacher.lastName = content.lastName
    if (content.name) teacher.name = content.name
    if (content.email) teacher.email = content.email
    if (content.avatarPath) teacher.avatarPath = content.avatarPath

    await teacher.save()

    return this.buildJSONResponse({ data: teacher })
  }
}
