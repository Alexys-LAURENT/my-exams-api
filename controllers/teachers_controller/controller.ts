import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { createTeacherValidator, onlyIdTeacherWithExistsValidator } from './validator.js'

export default class TeachersController extends AbstractController {
  constructor() {
    super()
  }

  public async deleteTeacher({ params }: HttpContext) {
    const teacher = await onlyIdTeacherWithExistsValidator.validate(params)
    await User.query().where('id_user', teacher.idTeacher).delete()
    return this.buildJSONResponse({ message: 'Teacher deleted successfully' })
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
