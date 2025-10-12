import Class from '#models/class'
import Exam from '#models/exam'
import AbstractController from '../abstract_controller.js'
import { classAndExamParamsValidator, examDateValidator } from './validator.js'
import type { HttpContext } from '@adonisjs/core/http'
import UnauthorizedException from '#exceptions/un_authorized_exception'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }

  async putExamsForClass({ params, request, auth }: HttpContext) {
      const user = auth.user
      if (user?.accountType !== 'teacher' && user?.accountType !== 'admin') {
        throw new UnauthorizedException('Seuls les professeurs peuvent ajouter des examens aux classes')
      }

      const validatedParams = await classAndExamParamsValidator.validate(params)

      const { idClass, idExam } = validatedParams

      // Récupérer la classe sans vérifier l'association existante
      const classInstance = await Class.findOrFail(idClass)

      const exam = await Exam.findOrFail(idExam)
      if (exam.idTeacher !== user?.idUser) {
        throw new UnauthorizedException('Vous ne pouvez ajouter que vos propres examens aux classes')
      }

      const bodyData = await examDateValidator.validate(request.body())

      // Les dates sont maintenant des objets Date JavaScript
      // Nous devons les convertir en format SQL pour l'ORM
      const startDate = bodyData.start_date.toISOString()
      const endDate = bodyData.end_date.toISOString()

      // Ajouter l'examen à la classe avec les dates pivot
      await classInstance.related('exams').attach({
        [idExam]: {
          start_date: startDate,
          end_date: endDate,
        },
      })

      return this.buildJSONResponse({
        message: 'Examen ajouté à la classe avec succès',
      })
  }
}
 