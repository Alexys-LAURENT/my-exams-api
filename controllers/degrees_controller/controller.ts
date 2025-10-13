import Class from '#models/class'
import Degree from '#models/degree'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdClassWithExistsValidator } from '../classes_controller/validator.js'
import { idDegreeExistsValidator } from './validator.js'
import UnAuthorizedException from '#exceptions/un_authorized_exception'

export default class DegreesController extends AbstractController {
  constructor() {
    super()
  }

  public async getPromosOfClass({ params }: HttpContext) {
    const valid = await onlyIdClassWithExistsValidator.validate({ idClass: params.idClasse })
    const theClass = await Class.findOrFail(valid.idClass)

    await theClass.load('degree')
    return this.buildJSONResponse({
      data: theClass.degree,
    })
  }
  

  public async deleteDegree({ params, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      throw new UnAuthorizedException('Seuls les administrateurs peuvent supprimer des diplômes')
    }

    const validatedParams = await idDegreeExistsValidator.validate(params)
    const { idDegree } = validatedParams

    const degree = await Degree.findOrFail(idDegree)

    await degree.delete()

    return this.buildJSONResponse({
      message: 'Diplôme supprimé avec succès'
    })
  }
}
