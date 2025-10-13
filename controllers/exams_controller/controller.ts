import ClientAccessibleException from '#exceptions/client_accessible_exception'
import UnauthorizedException from '#exceptions/un_authorized_exception'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import AbstractController from '../abstract_controller.js'
import Class from '#models/class'
import {
  createExamValidator,
  onlyIdExamWithExistsValidator,
  onlyIdTeacherWithExistsValidator,
  startExamValidator,
  checkStatusValidator,
  classExamParamsValidator
} from './validator.js'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }

  public async createExam({ request }: HttpContext) {
    const content = await createExamValidator.validate(request.body())
    const exam = await Exam.create({
      title: content.title,
      desc: content.desc,
      time: content.time,
      imagePath: content.imagePath ?? null,
      idTeacher: content.idTeacher,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    })
    return this.buildJSONResponse({ data: exam })
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

  public async getExamGradeForOneStudent({ params }: HttpContext) {
    const valid = await checkStatusValidator.validate(params)
    const examGrade = await ExamGrade.query()
      .where('id_user', valid.idStudent)
      .andWhere('id_exam', valid.idExam)
      .firstOrFail()
    return this.buildJSONResponse({ data: { status: !!examGrade } })
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
    
    await classInstance.related('exams').detach([idExam])

    return this.buildJSONResponse({ message: 'Examen désassocié de la classe avec succès' }) 
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
