import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdTeacherWithExistsValidator } from './validator.js'

export default class TeachersController extends AbstractController {
  constructor() {
    super()
  }

  public async getAllClassesForOneTeacher({ params }: HttpContext) {
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const theTeacher = await User.findOrFail(valid.idTeacher)
    const classes = await theTeacher.related('teacherClasses').query().orderBy('start_date', 'desc')
    return this.buildJSONResponse({
      data: classes,
    })
  }
}
