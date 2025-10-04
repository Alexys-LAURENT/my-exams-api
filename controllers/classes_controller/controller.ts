import Class from '#models/class'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdClassWithExistsValidator, onlyIdStudentWithExistsValidator } from './validator.js'

export default class ClassesController extends AbstractController {
  constructor() {
    super()
  }

  /**
   * Get one class
   */
  @inject()
  public async getOneClass({ params }: HttpContext) {
    const valid = await onlyIdClassWithExistsValidator.validate(params)
    const theClass = await Class.findOrFail(valid.idClass)
    return this.buildJSONResponse({
      data: theClass,
    })
  }

  public async getStudentClasses({ params }: HttpContext) {
    const valid = await onlyIdStudentWithExistsValidator.validate(params)
    const user = await User.findOrFail(valid.idStudent)
    const classes = await user.related('studentClasses').query()
    return this.buildJSONResponse({ data: classes })
  }
}
