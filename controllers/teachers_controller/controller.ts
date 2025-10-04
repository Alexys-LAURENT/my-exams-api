import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdTeacherWithExistsValidator } from './validator.js'

export default class TeachersController extends AbstractController {
  constructor() {
    super()
  }

  public async deleteTeacher({ params }: HttpContext) {
    const teacher = await onlyIdTeacherWithExistsValidator.validate(params)
    await User.query().where('id_user', teacher.idTeacher).delete()
    return this.buildJSONResponse({ data: teacher })
  }
}
