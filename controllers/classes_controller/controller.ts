import Class from '#models/class'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import {
  onlyIdClassWithExistsValidator,
  onlyIdTeacherWithExistsValidator,
  limitQueryValidator,
} from './validator.js'

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
    const { limit } = await request.validateUsing(limitQueryValidator)
    const query = theTeacher.related('teacherClasses').query().orderBy('start_date', 'desc')
    if (typeof limit === 'number') {
      query.limit(limit)
    }
    const classes = await query
    return this.buildJSONResponse({
      data: classes,
    })
  }
}
