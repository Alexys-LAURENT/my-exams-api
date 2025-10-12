import AbstractController from '../abstract_controller.js'
import Class from '#models/class'
import type { HttpContext } from '@adonisjs/core/http'
import { classTeacherParamsValidator } from './validator.js'
import UnauthorizedException from '#exceptions/un_authorized_exception'

export default class TeachersController extends AbstractController {
  constructor() {
    super()
  }

  public async putTeacherToClass({ params, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      throw new UnauthorizedException('Seuls les administrateurs peuvent ajouter un professeur à une classe')
    }

    const validatedParams = await classTeacherParamsValidator.validate(params)
    const { idClass, idTeacher } = validatedParams

    const classInstance = await Class.findOrFail(idClass)

    await classInstance.related('teachers').attach([idTeacher])

    return this.buildJSONResponse({
      message: 'Professeur associé à la classe avec succès'
    })
  }
}
