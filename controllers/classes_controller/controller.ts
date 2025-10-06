import { DeleteClassValidator } from './validator.js'
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

  public async deleteIdClass({ params, auth, response }: HttpContext) {
    // Vérifier que l'utilisateur est bien connecté
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      return response.unauthorized({ message: 'Seuls les admins peuvent supprimer une classe.' })
    }

    const valid = await DeleteClassValidator.validate(params)
    const theClass = await Class.findOrFail(valid.idClass)
    await theClass.delete()
    return this.buildJSONResponse({
      data: theClass,
    })
  }
  
}
