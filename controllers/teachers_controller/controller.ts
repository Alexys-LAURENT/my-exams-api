import AbstractController from '../abstract_controller.js'
import Class from '#models/class'
import type { HttpContext } from '@adonisjs/core/http'
import { classTeacherParamsValidator } from './validator.js'

export default class TeachersController extends AbstractController {
  constructor() {
    super()
  }

  public async putTeacherToClass({ params, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (!user || user.accountType !== 'admin') {
        return response.forbidden(this.buildJSONResponse({
          message: 'Seuls les administrateurs peuvent ajouter un professeur à une classe'
        }))
      }

      const validatedParams = await classTeacherParamsValidator.validate(params)
      const { idClass, idTeacher } = validatedParams

      const classInstance = await Class.findOrFail(idClass)

      await classInstance.load('teachers', (query) => {
        query.where('id_user', idTeacher)
      })

      if (classInstance.teachers.length > 0) {
        return response.badRequest(this.buildJSONResponse({
          message: 'Ce professeur est déjà associé à cette classe'
        }))
      }

      await classInstance.related('teachers').attach([idTeacher])

      return this.buildJSONResponse({
        message: 'Professeur ajouté à la classe avec succès'
      })
    } catch (error) {
      console.error(error)
      return response.internalServerError(this.buildJSONResponse({
        message: 'Erreur interne du serveur'
      }))
    }
  }
}
