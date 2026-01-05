import ClientAccessibleException from '#exceptions/client_accessible_exception'
import UnauthorizedException from '#exceptions/un_authorized_exception'
import Answer from '#models/answer'
import Class from '#models/class'
import Evaluation from '#models/evaluation'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import Question from '#models/question'
import UserResponse from '#models/user_response'
import examService from '#services/exam_service'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import AbstractController from '../abstract_controller.js'
import {
  createExamValidator,
  examDateValidator,
  getStudentExamsValidator,
  idClassAndIdExamWithExistsValidator,
  idStudentAndIdExamAndIdClassWithExistsValidator,
  onlyIdClassWithExistsValidator,
  onlyIdExamAndIdClassAndIdStudentWithExistsValidator,
  onlyIdExamWithExistsValidator,
  onlyIdTeacherWithExistsValidator,
  onlyLimitValidator,
  updateExamValidator,
} from './validator.js'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }

  public async getAllExamsOfClass({ params, request }: HttpContext) {
    const validParams = await onlyIdClassWithExistsValidator.validate(params)

    const theClass = await Class.findOrFail(validParams.idClass)

    const validQuery = await onlyLimitValidator.validate(request.qs())

    const { limit } = validQuery

    let examsQuery = theClass.related('exams').query().pivotColumns(['start_date', 'end_date'])

    if (limit) {
      examsQuery.limit(limit)
    }

    const exams = await examsQuery

    const serializedExams = exams.map((exam) => {
      return {
        ...exam.toJSON(),

        start_date: exam.$extras.pivot_start_date,
        end_date: exam.$extras.pivot_end_date,
      }
    })

    return this.buildJSONResponse({ data: serializedExams })
  }

  public async getExamsByTypeOfStudentInClass({ params, request, auth }: HttpContext) {
    const { idClass, idStudent, status } = await getStudentExamsValidator.validate(params)
    const user = await auth.authenticate()

    if (user.accountType === 'student' && user.idUser !== idStudent) {
      throw new UnauthorizedException('You can only access your own pending exams')
    }

    const theClass = await Class.findOrFail(idClass)

    const validQuery = await onlyLimitValidator.validate(request.qs())

    const { limit } = validQuery

    let examsQuery = theClass.related('exams').query().pivotColumns(['start_date', 'end_date'])

    const today = DateTime.now().toSQL()

    if (status === 'completed') {
      // Examens terminés (end_date dépassée) OU l'utilisateur a un exam_grade
      examsQuery.where((query) => {
        query.wherePivot('end_date', '<', today).orWhereExists((subQuery) => {
          subQuery
            .from('exam_grades')
            .whereRaw('exam_grades.id_exam = exams.id_exam')
            .where('exam_grades.id_user', idStudent)
            .where('exam_grades.id_class', idClass)
        })
      })
    } else if (status === 'pending') {
      // Examens en cours (start_date <= maintenant <= end_date) ET pas d'exam_grade
      examsQuery
        .wherePivot('start_date', '<=', today)
        .wherePivot('end_date', '>=', today)
        .whereNotExists((query) => {
          query
            .from('exam_grades')
            .whereRaw('exam_grades.id_exam = exams.id_exam')
            .where('exam_grades.id_user', idStudent)
            .where('exam_grades.id_class', idClass)
        })
    } else if (status === 'comming') {
      // Examens futurs (start_date > maintenant)
      examsQuery.wherePivot('start_date', '>', today)
    }

    // Tri par date de fin la plus proche d'aujourd'hui
    examsQuery.orderBy('exams_classes.end_date', 'desc')

    if (limit) {
      examsQuery.limit(limit)
    }

    const exams = await examsQuery

    const serializedExams = exams.map((exam) => {
      return {
        ...exam.toJSON(),

        start_date: exam.$extras.pivot_start_date,
        end_date: exam.$extras.pivot_end_date,
      }
    })

    return this.buildJSONResponse({ data: serializedExams })
  }

  public async getCountExamsByTypeOfStudentInClass({ params, auth }: HttpContext) {
    const { idClass, idStudent, status } = await getStudentExamsValidator.validate(params)
    const user = await auth.authenticate()

    if (user.accountType === 'student' && user.idUser !== idStudent) {
      throw new UnauthorizedException('You can only access your own pending exams')
    }

    const theClass = await Class.findOrFail(idClass)

    let examsQuery = theClass.related('exams').query()

    const today = DateTime.now().toSQL()

    if (status === 'completed') {
      // Examens terminés (end_date dépassée) OU l'utilisateur a un exam_grade
      examsQuery.where((query) => {
        query.wherePivot('end_date', '<', today).orWhereExists((subQuery) => {
          subQuery
            .from('exam_grades')
            .whereRaw('exam_grades.id_exam = exams.id_exam')
            .where('exam_grades.id_user', idStudent)
            .where('exam_grades.id_class', idClass)
        })
      })
    } else if (status === 'pending') {
      // Examens en cours (start_date <= maintenant <= end_date) ET pas d'exam_grade
      examsQuery
        .wherePivot('start_date', '<=', today)
        .wherePivot('end_date', '>=', today)
        .whereNotExists((query) => {
          query
            .from('exam_grades')
            .whereRaw('exam_grades.id_exam = exams.id_exam')
            .where('exam_grades.id_user', idStudent)
            .where('exam_grades.id_class', idClass)
        })
    } else if (status === 'comming') {
      // Examens futurs (start_date > maintenant)
      examsQuery.wherePivot('start_date', '>', today)
    }

    const count = await examsQuery.count('* as total')

    return this.buildJSONResponse({ data: { count: count[0].$extras.total } })
  }

  async putExamsForClass({ params, request, auth }: HttpContext) {
    const user = auth.user
    if (user?.accountType !== 'teacher' && user?.accountType !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les professeurs peuvent ajouter des examens aux classes'
      )
    }

    const validatedParams = await idClassAndIdExamWithExistsValidator.validate(params)

    const { idClass, idExam } = validatedParams

    const classInstance = await Class.findOrFail(idClass)

    const exam = await Exam.findOrFail(idExam)
    if (exam.idTeacher !== user?.idUser) {
      throw new UnauthorizedException('Vous ne pouvez ajouter que vos propres examens aux classes')
    }

    const bodyData = await examDateValidator.validate(request.body())

    const startDate = bodyData.start_date.toISOString()
    const endDate = bodyData.end_date.toISOString()

    // Ajouter l'examen à la classe avec les dates dans la table pivot
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

  public async createExam({ request }: HttpContext) {
    const content = await createExamValidator.validate(request.body())
    const exam = await Exam.create({
      title: content.title,
      desc: content.desc,
      time: content.time,
      imagePath: content.imagePath ?? null,
      idTeacher: content.idTeacher,
      idMatiere: content.idMatiere,
    })
    return this.buildJSONResponse({ data: exam })
  }

  public async getOneExam({ params, auth }: HttpContext) {
    const user = await auth.authenticate()
    const valid = await onlyIdExamWithExistsValidator.validate(params)
    let theExam: Exam | null = null
    if (user.accountType === 'student') {
      const userClasses = await user.related('studentClasses').query()
      theExam = await Exam.query()
        .where('id_exam', valid.idExam)
        .andWhereHas('classes', (query) => {
          query.whereIn(
            'classes.id_class',
            userClasses.map((c) => c.idClass)
          )
        })
        .first()

      if (!theExam) {
        throw new UnauthorizedException("You don't have access to this exam")
      }
    } else if (user.accountType === 'teacher') {
      const teacherExams = await user.related('teacherExams').query()
      theExam = teacherExams.find((exam) => exam.idExam === valid.idExam) || null
      if (!theExam) {
        throw new UnauthorizedException("You don't have access to this exam")
      }
    } else {
      theExam = await Exam.findOrFail(valid.idExam)
    }
    return this.buildJSONResponse({
      data: theExam,
    })
  }

  public async getAllExamsForOneTeacher({ params }: HttpContext) {
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const exams = await Exam.query().where('id_teacher', valid.idTeacher)
    return this.buildJSONResponse({ data: exams })
  }

  public async deleteExamFromClass({ params, auth }: HttpContext) {
    const user = auth.user
    if (!user || (user.accountType !== 'teacher' && user.accountType !== 'admin')) {
      throw new UnauthorizedException(
        "Seuls les professeurs et administrateurs peuvent désassocier un examen d'une classe"
      )
    }
    const validatedParams = await idClassAndIdExamWithExistsValidator.validate(params)
    const { idClass, idExam } = validatedParams
    const classInstance = await Class.findOrFail(idClass)

    if (user.accountType === 'teacher') {
      const exam = await Exam.findOrFail(idExam)
      if (exam.idTeacher !== user.idUser) {
        throw new UnauthorizedException('Vous ne pouvez désassocier que vos propres examens')
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

    const valid = await onlyIdExamAndIdClassAndIdStudentWithExistsValidator.validate(params)

    if (user.idUser !== valid.idStudent) {
      throw new UnauthorizedException('You can only start an exam for yourself')
    }

    // On récupère la classe actuelle de l'étudiant
    const currentUserClass = await Class.findOrFail(valid.idClass)

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

    const newExamGrade = await ExamGrade.create({
      idExam: exam.idExam,
      idUser: user.idUser,
      idClass: currentUserClass.idClass,
      status: 'en cours',
      note: undefined,
    })

    const questionsOfExam = await Question.query()
      .where('id_exam', valid.idExam)
      .where('id_exam', valid.idExam)
    const answersOfQuestions = await Answer.query()
      .select(['id_answer', 'answer', 'id_question', 'id_exam'])
      .where('id_exam', valid.idExam)
      .andWhereIn(
        'id_question',
        questionsOfExam.map((q) => q.idQuestion)
      )

    const questionsWithAnswersOfExam = questionsOfExam.map((question) => {
      return {
        ...question.toJSON(),
        answers: answersOfQuestions.filter((answer) => answer.idQuestion === question.idQuestion),
      }
    })

    const allData = {
      ...exam.toJSON(),
      questions: questionsWithAnswersOfExam,
    }

    await examService.startExam(
      user.idUser,
      valid.idClass,
      exam.idExam,
      newExamGrade.idExamGrade,
      exam.time * 60
    )

    return this.buildJSONResponse({ message: 'Exam started', data: allData })
  }

  public async reTakeExam({ params, auth }: HttpContext) {
    const user = await auth.authenticate()

    if (user.accountType !== 'student') {
      throw new UnauthorizedException('Only students can start an exam')
    }

    const valid = await onlyIdExamAndIdClassAndIdStudentWithExistsValidator.validate(params)

    if (user.idUser !== valid.idStudent) {
      throw new UnauthorizedException('You can only retake an exam for yourself')
    }

    const existingPendingExamGrade = await ExamGrade.query()
      .where('id_exam', valid.idExam)
      .andWhere('id_user', user.idUser)
      .andWhere('id_class', valid.idClass)
      .where('status', 'en cours')
      .first()

    if (!existingPendingExamGrade) {
      throw new UnauthorizedException("You don't have any pending exam of this type")
    }

    const exam = await Exam.findOrFail(valid.idExam)

    const currentExamSessionData = examService.getRemainingTime(
      user.idUser,
      valid.idClass,
      valid.idExam
    )
    if (!currentExamSessionData) {
      throw new ClientAccessibleException(
        'No active exam session found. Please start the exam again.'
      )
    }

    if (currentExamSessionData.remainingInSecondes < 30) {
      await examService.stopExam(user.idUser, valid.idClass, valid.idExam)
      return this.buildJSONResponse({
        message: 'Exam stopped because not enough time remaining to retake.',
        data: null,
        forcedStop: true,
      })
    }

    const questionsOfExam = await Question.query()
      .where('id_exam', valid.idExam)
      .where('id_exam', valid.idExam)
    const answersOfQuestions = await Answer.query()
      .select(['id_answer', 'answer', 'id_question', 'id_exam'])
      .where('id_exam', valid.idExam)
      .andWhereIn(
        'id_question',
        questionsOfExam.map((q) => q.idQuestion)
      )
    const userResponses = await UserResponse.query()
      .where('id_exam', valid.idExam)
      .andWhere('id_user', user.idUser)

    const userResponsesAnswers = (await db
      .query()
      .from('user_responses_answers')
      .whereIn(
        'id_user_response',
        userResponses.map((response) => response.idUserResponse)
      )) as { id_user_response: number; id_answer: number; id_question: number; id_exam: number }[]

    const questionsWithAnswersOfExam = questionsOfExam.map((question) => {
      return {
        ...question.toJSON(),
        answers: answersOfQuestions.filter((answer) => answer.idQuestion === question.idQuestion),
        ...(() => {
          const userResponse = userResponses.find((ur) => ur.idQuestion === question.idQuestion)
          if (userResponse) {
            const selectedAnswers = userResponsesAnswers
              .filter((ura) => ura.id_user_response === userResponse.idUserResponse)
              .map((ura) => ura.id_answer)
            return {
              userResponse: {
                idUserResponse: userResponse.idUserResponse,
                custom: userResponse.custom,
                selectedAnswers,
              },
            }
          } else {
            return {}
          }
        })(),
      }
    })

    const allData = {
      ...exam.toJSON(),
      questions: questionsWithAnswersOfExam,
    }

    return this.buildJSONResponse({ message: 'Exam reTaked', data: allData })
  }

  public async stopExam({ params, auth }: HttpContext) {
    const user = await auth.authenticate()

    if (user.accountType !== 'student') {
      throw new UnauthorizedException('Only students can stop an exam')
    }

    const valid = await onlyIdExamAndIdClassAndIdStudentWithExistsValidator.validate(params)

    if (user.idUser !== valid.idStudent) {
      throw new UnauthorizedException('You can only stop an exam for yourself')
    }

    const res = await examService.stopExam(user.idUser, valid.idClass, valid.idExam)

    if ('error' in res) {
      throw new ClientAccessibleException(res.message)
    }

    return this.buildJSONResponse({
      message: 'Exam stopped successfully',
    })
  }

  public async recap({ params, auth }: HttpContext) {
    const valid = await idStudentAndIdExamAndIdClassWithExistsValidator.validate(params)
    const loggedUser = await auth.authenticate()

    if (loggedUser.accountType === 'student' && loggedUser.idUser !== valid.idStudent) {
      throw new UnauthorizedException('Students can only access their own exam recaps')
    }

    // The exam
    const exam = await Exam.findOrFail(valid.idExam)

    if (loggedUser.accountType === 'teacher' && exam.idTeacher !== loggedUser.idUser) {
      throw new UnauthorizedException('Teachers can only access recaps of their own exams')
    }

    const examGrade = await ExamGrade.query()
      .where('id_user', valid.idStudent)
      .andWhere('id_exam', valid.idExam)
      .andWhere('id_class', valid.idClass)
      .andWhereNot('status', 'en cours')
      .first()

    const relationExamClass = (await db
      .from('exams_classes')
      .where({
        id_exam: valid.idExam,
        id_class: valid.idClass,
      })
      .first()) as
      | { id_exam: number; id_class: number; start_date: Date; end_date: Date }
      | undefined

    if (!relationExamClass) {
      throw new ClientAccessibleException("This exam isn't associated with this class")
    }

    const isExamTimeFinished = DateTime.now() > DateTime.fromJSDate(relationExamClass.end_date)

    if (!isExamTimeFinished && loggedUser.accountType === 'student') {
      return this.buildJSONResponse({
        data: {
          ...exam.toJSON(),
          examGrade: examGrade ? { ...examGrade.toJSON(), note: '-' } : null,
          isExamTimeFinished,
        },
      })
    }

    // The questions of the exam
    const questions = await Question.query().where('id_exam', valid.idExam)
    // The answers of exma's questions that are `is_qcm`
    const answers = await Answer.query().where('id_exam', valid.idExam)
    // The user responses of the student for this exam
    const userResponses = await UserResponse.query()
      .where('id_user', valid.idStudent)
      .andWhere('id_exam', valid.idExam)
    // The user responses answers for questions that are `is_qcm`
    const userResponsesAnswers = (await db
      .query()
      .from('user_responses_answers')
      .whereIn(
        'id_user_response',
        userResponses.map((response) => response.idUserResponse)
      )) as { id_user_response: number; id_answer: number; id_question: number; id_exam: number }[]
    // The evaluations for the user responses
    const evaluations = await Evaluation.query()
      .whereIn(
        'id_user_response',
        userResponses.map((ur) => ur.idUserResponse)
      )
      .andWhere('id_student', valid.idStudent)

    const recap = {
      ...exam.toJSON(),
      questions: questions.map((question) => {
        const questionAnswers = answers.filter(
          (answer) => answer.idQuestion === question.idQuestion
        )
        const correctAnswers = questionAnswers.filter((answer) => answer.isCorrect)
        const userResponse = userResponses.find((ur) => ur.idQuestion === question.idQuestion)
        const userSelectedAnswers = userResponsesAnswers.filter(
          (ura) => ura.id_user_response === userResponse?.idUserResponse
        )
        const evaluation = evaluations.find(
          (ev) => ev.idUserResponse === userResponse?.idUserResponse
        )
        return {
          ...question.toJSON(),
          answers: questionAnswers,
          correctAnswers,
          userResponse: {
            ...userResponse?.toJSON(),
            selectedAnswers: userSelectedAnswers,
          },
          evaluation: evaluation ? evaluation.toJSON() : null,
        }
      }),
      examGrade: examGrade ? examGrade.toJSON() : null,
      isExamTimeFinished,
    }

    return this.buildJSONResponse({ data: recap })
  }

  public async updateExam({ params, request, auth }: HttpContext) {
    const user = await auth.authenticate()
    if (!user || user.accountType !== 'teacher') {
      throw new UnauthorizedException('Seuls les enseignants peuvent modifier un examen')
    }

    const content = await updateExamValidator.validate(request.body())
    const exam = await Exam.findOrFail(params.idExam)

    // Vérifier que l'enseignant est propriétaire de l'examen
    if (exam.idTeacher !== user.idUser) {
      throw new UnauthorizedException('Vous ne pouvez modifier que vos propres examens')
    }

    // Vérifier qu'aucune classe n'a commencé
    const examClasses = await exam
      .related('classes')
      .query()
      .pivotColumns(['start_date', 'end_date'])
    const now = DateTime.now()
    const hasStarted = examClasses.some((ec) => {
      const startDate = ec.$extras.pivot_start_date
      return startDate && DateTime.fromJSDate(startDate) <= now
    })

    if (hasStarted) {
      throw new UnauthorizedException(
        'Cet examen ne peut plus être modifié car au moins une classe a déjà commencé'
      )
    }

    // Mettre à jour l'examen
    if (content.title) exam.title = content.title
    if (content.desc !== undefined) exam.desc = content.desc
    if (content.time) exam.time = content.time
    if (content.idMatiere) exam.idMatiere = content.idMatiere

    await exam.save()
    return this.buildJSONResponse({ data: exam })
  }

  /**
   * Récupère les classes assignées à un examen avec leurs dates
   */
  public async getExamClasses({ params }: HttpContext) {
    const valid = await onlyIdExamWithExistsValidator.validate(params)
    const exam = await Exam.findOrFail(valid.idExam)

    const examClasses = await exam
      .related('classes')
      .query()
      .pivotColumns(['start_date', 'end_date'])

    const serializedClasses = examClasses.map((classItem) => ({
      ...classItem.toJSON(),
      start_date: classItem.$extras.pivot_start_date,
      end_date: classItem.$extras.pivot_end_date,
    }))

    return this.buildJSONResponse({ data: serializedClasses })
  }
}
