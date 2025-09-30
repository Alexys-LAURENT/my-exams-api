import Class from '#models/class'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdClassWithExistsValidator } from './validator.js'

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

  public async getPromosOfClass({ params }: HttpContext) {
    const valid = await onlyIdClassWithExistsValidator.validate({ idClass: params.idClasse })
    const theClass = await Class.findOrFail(valid.idClass)
    await theClass.load('degree')
    return this.buildJSONResponse({
      data: theClass.degree
    })
  }
}
