import Class from '#models/class'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdClassWithExistsValidator } from '../classes_controller/validator.js'
import { createStudentValidator } from '../students_controller/validator.js'

export default class StudentsController extends AbstractController {
  constructor() {
    super()
  }
  public async createStudent({ request }: HttpContext) {
    const content = await createStudentValidator.validate(request.body())
    const student = await User.create({
      lastName: content.lastName,
      name: content.name,
      email: content.email,
      password: content.password,
      avatarPath: content.avatarPath ?? null,
      accountType: 'student',
    })
    return this.buildJSONResponse({ data: student })
  }

  public async getStudentsOfClass({ params }: HttpContext) {
    const valid = await onlyIdClassWithExistsValidator.validate(params)
    const theClass = await Class.findOrFail(valid.idClass)

    const students = await theClass.related('students').query()

    return this.buildJSONResponse({ data: students })
  }
}
