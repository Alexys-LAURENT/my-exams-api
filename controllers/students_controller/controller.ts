import Class from '#models/class'
import AbstractController from '../abstract_controller.js'
import { onlyIdClassWithExistsValidator, classStudentParamsValidator } from './validator.js'
import type { HttpContext } from '@adonisjs/core/http'
import UnAuthorizedException from '#exceptions/un_authorized_exception'


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

  public async putStudentToClass({ params, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      throw new UnAuthorizedException('Seuls les administrateurs peuvent associer un étudiant à une classe')
    }

    const validatedParams = await classStudentParamsValidator.validate(params)
    const { idClass, idStudent } = validatedParams

    const classInstance = await Class.findOrFail(idClass)
    
    await classInstance.related('students').attach([idStudent])

    return this.buildJSONResponse({
      message: 'Étudiant associé à la classe avec succès'
    })
  }
}
