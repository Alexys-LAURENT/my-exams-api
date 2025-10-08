import AbstractController from '../abstract_controller.js'
import Class from '#models/class'
import type { HttpContext } from '@adonisjs/core/http'
import { classTeacherAssociationValidator } from '../teachers_controller/validator.js'

export default class TeachersController extends AbstractController {
  constructor() {
    super()
  }

  public async removeTeacherFromClass({ params, response, auth }: HttpContext) {
    try {
      // Vérifier si l'utilisateur connecté est un administrateur
      const user = auth.user
      if (!user || user.accountType !== 'admin') {
        return response.forbidden(this.buildJSONResponse({
          message: 'Seuls les administrateurs peuvent retirer un professeur d\'une classe'
        }))
      }
      
      // Valider les paramètres
      const validatedParams = await classTeacherAssociationValidator.validate(params)
      const { idClass, idTeacher } = validatedParams

      const classInstance = await Class.findOrFail(idClass)
      
      await classInstance.load('teachers', (query) => {
        query.where('id_user', idTeacher)
      })

      if (classInstance.teachers.length === 0) {
        return response.badRequest(this.buildJSONResponse({
          message: 'Ce professeur n\'est pas associé à cette classe'
        }))
      }

      await classInstance.related('teachers').detach([idTeacher])

      return this.buildJSONResponse({
        message: 'Professeur retiré de la classe avec succès'
      })
    } catch (error) {

      console.error(error)
      return response.internalServerError(this.buildJSONResponse({
        message: 'Erreur interne du serveur'
      }))
    }
  }


}
