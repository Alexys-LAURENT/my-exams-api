import { DeleteClassValidator } from './validator.js'
import Class from '#models/class'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import UnauthorizedException from '#exceptions/un_authorized_exception'
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

  public async deleteIdClass({ params, auth }: HttpContext) {
    // Vérifier que l'utilisateur est bien connecté
    const user = auth.user

    if (!user || user.accountType !== 'admin') {
      throw new UnauthorizedException('Seuls les admins peuvent supprimer une classe.')
    }

    const valid = await DeleteClassValidator.validate(params)
    const theClass = await Class.findOrFail(valid.idClass)
    await theClass.delete()

    return this.buildJSONResponse({
      data: theClass,
    })
  }
}
  public async getStudentClasses({ params }: HttpContext) {
    const valid = await onlyIdStudentWithExistsValidator.validate(params)
    const user = await User.findOrFail(valid.idStudent)
    const classes = await user.related('studentClasses').query()
    return this.buildJSONResponse({ data: classes })
  }
}
