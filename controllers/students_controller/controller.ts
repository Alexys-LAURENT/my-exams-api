import Class from '#models/class'
import User from '#models/user'
import AbstractController from '../abstract_controller.js'
import { onlyIdClassWithExistsValidator, onlyIdStudentWithExistsValidator } from '../classes_controller/validator.js'
import { createStudentValidator, updateStudentValidator } from '../students_controller/validator.js'
import type { HttpContext } from '@adonisjs/core/http'

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

  public async updateStudent({ request, params }: HttpContext) {
    const content = await updateStudentValidator.validate(request.body())
    const valid = await onlyIdStudentWithExistsValidator.validate(params)
    const student = await User.findOrFail(valid.idStudent)

    if (content.lastName) student.lastName = content.lastName
    if (content.name) student.name = content.name
    if (content.email) student.email = content.email
    if (content.avatarPath) student.avatarPath = content.avatarPath
    if (content.password) student.password = content.password

    await student.save()

    return this.buildJSONResponse({ data: student })
  }

  public async getStudentsOfClass({ params }: HttpContext) {
    const valid = await onlyIdClassWithExistsValidator.validate(params)
    const theClass = await Class.findOrFail(valid.idClass)

    const students = await theClass.related('students').query()

    return this.buildJSONResponse({ data: students })
  }
}
