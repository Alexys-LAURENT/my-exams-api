import Class from '#models/class'
import AbstractController from '../abstract_controller.js'
import { onlyIdClassWithExistsValidator, classStudentParamsValidator } from './validator.js'
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

  public async putStudentToClass({ params, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user || user.accountType !== 'admin') {
        return response.forbidden(this.buildJSONResponse({
          message: 'Seuls les administrateurs peuvent ajouter un étudiant à une classe'
        }))
      }

      const validatedParams = await classStudentParamsValidator.validate(params)
      const { idClass, idStudent } = validatedParams

      const classInstance = await Class.findOrFail(idClass)
      
      await classInstance.load('students', (query) => {
        query.where('users.id_user', idStudent)
      })

      if (classInstance.students.length > 0) {
        return response.badRequest(this.buildJSONResponse({
          message: 'Cet étudiant est déjà associé à cette classe'
        }))
      }

      await classInstance.related('students').attach([idStudent])

      return this.buildJSONResponse({
        message: 'Étudiant ajouté à la classe avec succès'
      })
    } catch (error) {
      console.error(error)
      return response.internalServerError(this.buildJSONResponse({
        message: 'Erreur interne du serveur'
      }))
    }
  }
}
