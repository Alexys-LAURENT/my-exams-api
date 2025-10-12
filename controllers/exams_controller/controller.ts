import AbstractController from '../abstract_controller.js'
import Class from '#models/class'
import Exam from '#models/exam'
import type { HttpContext } from '@adonisjs/core/http'
import { classExamParamsValidator } from './validator.js'
import UnAuthorizedException from '#exceptions/un_authorized_exception'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }

  public async deleteExamFromClass({ params, auth }: HttpContext) {
    const user = auth.user
    if (!user || (user.accountType !== 'teacher' && user.accountType !== 'admin')) {
      throw new UnAuthorizedException('Seuls les professeurs et administrateurs peuvent désassocier un examen d\'une classe')
    }

    const validatedParams = await classExamParamsValidator.validate(params)
    const { idClass, idExam } = validatedParams

    const classInstance = await Class.findOrFail(idClass)
    
    if (user.accountType === 'teacher') {
      const exam = await Exam.findOrFail(idExam)
      if (exam.idTeacher !== user.idUser) {
        throw new UnAuthorizedException('Vous ne pouvez désassocier que vos propres examens')
      }
    }

    // Association directe sans vérification préalable
    await classInstance.related('exams').detach([idExam])

    return this.buildJSONResponse({
      message: 'Examen désassocié de la classe avec succès'
    })
  }
}
