import AbstractController from '../abstract_controller.js'
import Class from '#models/class'
import type { HttpContext } from '@adonisjs/core/http'
import { classTeacherAssociationValidator } from '../teachers_controller/validator.js'
import UnauthorizedException from '#exceptions/un_authorized_exception'

export default class TeachersController extends AbstractController {
  constructor() {
    super()
  }

  public async removeTeacherFromClass({ params, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      throw new UnauthorizedException('Seuls les administrateurs peuvent retirer un professeur d\'une classe')
    }
      
    // Valider les paramètres
    const validatedParams = await classTeacherAssociationValidator.validate(params)
    const { idClass, idTeacher } = validatedParams

    const classInstance = await Class.findOrFail(idClass)
    
    await classInstance.related('teachers').detach([idTeacher])

    return this.buildJSONResponse({
      message: 'Professeur retiré de la classe avec succès'
    })
  }
}