import ClientAccessibleException from '#exceptions/client_accessible_exception'
import UnauthorizedException from '#exceptions/un_authorized_exception'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AbstractController from '../abstract_controller.js'
import { onlyIdTeacherWithExistsValidator, startExamValidator, onlyIdExamWithExistsValidator } from './validator.js'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }

  public async getOneExam({ params }: HttpContext) {
    const valid = await onlyIdExamWithExistsValidator.validate(params)
    const theExam = await Exam.findOrFail(valid.idExam)
    return this.buildJSONResponse({
      data: theExam,
    })
  }
  
  public async getAllExamsForOneTeacher({ params }: HttpContext) {
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const exams = await Exam.query().where('id_teacher', valid.idTeacher)
    return this.buildJSONResponse({ data: exams })
  }

  public async startExam({ params, auth }: HttpContext) {
    const user = await auth.authenticate()

    if (user.accountType !== 'student') {
      throw new UnauthorizedException('Only students can start an exam')
    }

    const valid = await startExamValidator.validate(params)

    // On récupère la classe actuelle de l'étudiant
    const currentUserClass = await user
      .related('studentClasses')
      .query()
      .where('classes.start_date', '<=', DateTime.now().toSQL())
      .where('classes.end_date', '>=', DateTime.now().toSQL())
      .firstOrFail()

    // On vérifie que l'examen est bien lié à la classe de l'étudiant et que la période de réalisation est valide
    const exam = await Exam.query()
      .where('id_exam', valid.idExam)
      .andWhereHas('classes', (query) => {
        query
          .where('exams_classes.id_class', currentUserClass.idClass)
          .where('exams_classes.start_date', '<=', DateTime.now().toSQL())
          .andWhere((q) => {
            q.where('exams_classes.end_date', '>=', DateTime.now().toSQL())
          })
      })
      .first()

    if (!exam) {
      throw new ClientAccessibleException(
        'Exam not found or not available for your class at this time'
      )
    }

    await ExamGrade.create({
      idExam: exam.idExam,
      idUser: user.idUser,
      status: 'en cours',
      note: undefined,
    })

    return this.buildJSONResponse({ message: 'Exam started' })
  }
  
}
