import Class from '#models/class'
import Exam from '#models/exam'
import AbstractController from '../abstract_controller.js'
import { classAndExamParamsValidator, examDateValidator } from './validator.js'
import type { HttpContext } from '@adonisjs/core/http'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }

  async putExamsForClass({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.user
      if (user?.accountType !== 'teacher' && user?.accountType !== 'admin') {
        return response.forbidden(this.buildJSONResponse({
          message: 'Seuls les professeurs peuvent ajouter des examens aux classes',
        }))
      }

      const validatedParams = await classAndExamParamsValidator.validate(params)
      const { idClass, idExam } = validatedParams

      const classInstance = await Class.query()
        .where('id_class', idClass)
        .preload('exams', (query) => {
          query.where('exams.id_exam', idExam)
        })
        .firstOrFail()

      if (classInstance.exams.length > 0) {
        return response.badRequest(this.buildJSONResponse({
          message: 'Cet examen est déjà associé à cette classe',
        }))
      }

      const exam = await Exam.findOrFail(idExam)
      if (exam.idTeacher !== user?.idUser) {
        return response.forbidden(this.buildJSONResponse({
          message: 'Vous ne pouvez ajouter que vos propres examens aux classes',
        }))
      }

      // Valider les données du corps de la requête
      const bodyData = await examDateValidator.validate(request.body())

      // Vérifier que les dates sont fournies
      if (!bodyData.start_date || !bodyData.end_date) {
        return response.badRequest(this.buildJSONResponse({
          message: 'Les dates de début et de fin sont requises',
        }))
      }

      // Ajouter l'examen à la classe avec les dates pivot
      await classInstance.related('exams').attach({
        [idExam]: {
          start_date: bodyData.start_date,
          end_date: bodyData.end_date,
        },
      })

      return this.buildJSONResponse({
        message: 'Examen ajouté à la classe avec succès',
        data: {
          idClass,
          idExam,
          start_date: bodyData.start_date,
          end_date: bodyData.end_date,
        },
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound(this.buildJSONResponse({
          message: 'Classe ou examen non trouvé',
        }))
      }

      console.error(error)
      return response.internalServerError(this.buildJSONResponse({
        message: 'Erreur interne du serveur',
      }))
    }
  }
}
 