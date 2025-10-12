import Class from '#models/class'
import Degree from '#models/degree'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdClassWithExistsValidator, idDegreeExistsValidator, degreeValidator } from './validator.js'
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


  public async updateDegree({ params, request, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      throw new UnAuthorizedException('Seuls les administrateurs peuvent modifier des diplômes')
    }

    const validatedParams = await idDegreeExistsValidator.validate({ idDegree: params.idDegree })
    const { idDegree } = validatedParams

    // Validation des données de la requête
    const data = await degreeValidator.validate(request.body())
    
    // Récupération du diplôme
    const degree = await Degree.findOrFail(idDegree)
    
    // Mise à jour des informations du diplôme
    degree.name = data.name
    await degree.save()

    return this.buildJSONResponse({
      message: 'Diplôme mis à jour avec succès',
      data: degree
    })
  }
}

