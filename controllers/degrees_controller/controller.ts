import AbstractController from '../abstract_controller.js'
import Class from '#models/class'
import { onlyIdClassWithExistsValidator } from '../classes_controller/validator.js'
import type { HttpContext } from '@adonisjs/core/http'

export default class DegreesController extends AbstractController {
  constructor() {
    super()
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
