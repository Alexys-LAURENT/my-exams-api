import Class from '#models/class'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdClassWithExistsValidator, onlyIdTeacherWithExistsValidator } from './validator.js'

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

  public async getAll({}: HttpContext) {
    const classes = await Class.all()
    return this.buildJSONResponse({ data: classes })
  }

  public async getAllClassesForOneTeacher({ params, request }: HttpContext) {
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const theTeacher = await User.findOrFail(valid.idTeacher)
    const { limit: limitParam } = request.qs() as { limit?: string }
    let classes
    if (limitParam != null && limitParam !== undefined) {
      const limit = parseInt(limitParam, 10)
      classes = await theTeacher
        .related('teacherClasses')
        .query()
        .orderBy('start_date', 'desc')
        .limit(limit)
    } else {
      classes = await theTeacher.related('teacherClasses').query().orderBy('start_date', 'desc')
    }
    return this.buildJSONResponse({
      data: classes,
    })
  }
}
