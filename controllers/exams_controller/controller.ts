import AbstractController from '../abstract_controller.js'
import Class from '#models/class'
import Exam from '#models/exam'
import type { HttpContext } from '@adonisjs/core/http'
import { classExamParamsValidator } from './validator.js'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }

  public async deleteExamFromClass({ params, response, auth }: HttpContext) {
    try {

      const user = auth.user
      if (!user || (user.accountType !== 'teacher' && user.accountType !== 'admin')) {
        return response.forbidden(this.buildJSONResponse({
          message: 'Seuls les professeurs et administrateurs peuvent supprimer un examen d\'une classe'
        }))
      }

      const validatedParams = await classExamParamsValidator.validate(params)
      const { idClass, idExam } = validatedParams

      const classInstance = await Class.findOrFail(idClass)
      
      await classInstance.load('exams', (query) => {
        query.where('exams.id_exam', idExam)
      })

      if (classInstance.exams.length === 0) {
        // L'examen n'étant pas associé, on considère que c'est déjà "supprimé"
        return this.buildJSONResponse({
          message: 'Examen déjà dissocié de la classe ou jamais associé'
        })
      }

      if (user.accountType === 'teacher') {
        const exam = await Exam.findOrFail(idExam)
        if (exam.idTeacher !== user.idUser) {
          return response.forbidden(this.buildJSONResponse({
            message: 'Vous ne pouvez supprimer que vos propres examens'
          }))
        }
      }

      await classInstance.related('exams').detach([idExam])

      return this.buildJSONResponse({
        message: 'Examen retiré de la classe avec succès'
      })
    } catch (error) {
      console.error(error)
      return response.internalServerError(this.buildJSONResponse({
        message: 'Erreur interne du serveur'
      }))
    }
  }
}
