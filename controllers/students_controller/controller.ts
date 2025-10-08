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

  public async deleteStudentFromClass({ params, response, auth }: HttpContext) {
    try {
      // Vérifier si l'utilisateur connecté est un administrateur
      const user = auth.user
      if (!user || user.accountType !== 'admin') {
        return response.forbidden(this.buildJSONResponse({
          message: 'Seuls les administrateurs peuvent retirer un étudiant d\'une classe'
        }))
      }

      // Valider les paramètres
      const validatedParams = await classStudentParamsValidator.validate(params)
      const { idClass, idStudent } = validatedParams

      // Récupérer la classe
      const classInstance = await Class.findOrFail(idClass)
      
      // Charger les étudiants associés
      await classInstance.load('students', (query) => {
        query.where('id_user', idStudent)
      })

      // Vérifier si l'étudiant est associé à cette classe
      if (classInstance.students.length === 0) {
        // L'étudiant n'étant pas associé, on considère que c'est déjà "supprimé"
        return this.buildJSONResponse({
          message: 'Étudiant déjà dissocié de la classe ou jamais associé'
        })
      }

      // Dissocier l'étudiant de la classe
      await classInstance.related('students').detach([idStudent])

      return this.buildJSONResponse({
        message: 'Étudiant retiré de la classe avec succès'
      })
    } catch (error) {
      console.error(error)
      return response.internalServerError(this.buildJSONResponse({
        message: 'Erreur interne du serveur'
      }))
    }
  }
}
