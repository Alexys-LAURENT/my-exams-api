import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdTeacherWithExistsValidator } from './validator.js'

export default class TeachersController extends AbstractController {
  constructor() {
    super()
  }

  public async getOneTeacher({ params }: HttpContext) {
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const theTeacher = await User.findOrFail(valid.idTeacher)
    return this.buildJSONResponse({
      data: theTeacher,
    })
  }

  public async getAll() {
    const teachers = await User.query().where('account_type', 'teacher')
    return this.buildJSONResponse({ data: teachers })
  }

}
