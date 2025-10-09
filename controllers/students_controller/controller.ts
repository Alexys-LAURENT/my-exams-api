import Class from '#models/class'
import AbstractController from '../abstract_controller.js'
import { onlyIdClassWithExistsValidator } from '../classes_controller/validator.js'
import type { HttpContext } from '@adonisjs/core/http'

export default class StudentsController extends AbstractController {
  constructor() {
    super()
  }

  public async getStudentsOfClass({ params }: HttpContext) {
    const valid = await onlyIdClassWithExistsValidator.validate(params)
    const theClass = await Class.findOrFail(valid.idClass)

    const students = await theClass.related('students').query()

    return this.buildJSONResponse({ data: students })
  }

}
