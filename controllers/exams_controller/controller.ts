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
  getExamsOfClassQueryValidator,
  idClassAndIdExamWithExistsValidator,
  idStudentAndIdExamWithExistsValidator,
  onlyIdClassWithExistsValidator,
  onlyIdExamWithExistsValidator,
  onlyIdTeacherWithExistsValidator,
} from './validator.js'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }

  public async getExamsOfClass({ params, request, auth }: HttpContext) {
    const validParams = await onlyIdClassWithExistsValidator.validate(params)

    const theClass = await Class.findOrFail(validParams.idClass)

    const validQuery = await getExamsOfClassQueryValidator.validate(request.qs())

    const { status, limit } = validQuery

    let examsQuery = theClass.related('exams').query().pivotColumns(['start_date', 'end_date'])

    const user = await auth.authenticate()

    const userId = user.idUser

    const today = DateTime.now().toSQL()

    if (status && userId) {
      if (status === 'completed') {
        examsQuery.whereExists((query) => {
          query
            .from('exam_grades')
            .whereRaw('exam_grades.id_exam = exams.id_exam')
            .where('exam_grades.id_user', userId)
        })
      } else if (status === 'pending') {
        examsQuery
          .wherePivot('start_date', '<=', today)
          .wherePivot('end_date', '>=', today)
          .whereNotExists((query) => {
            query
              .from('exam_grades')
              .whereRaw('exam_grades.id_exam = exams.id_exam')
              .where('exam_grades.id_user', userId)
          })
      } else if (status === 'comming') {
        examsQuery.wherePivot('start_date', '>', today).whereNotExists((query) => {
          query
            .from('exam_grades')
            .whereRaw('exam_grades.id_exam = exams.id_exam')
            .where('exam_grades.id_user', userId)
        })
      }
    }

    if (limit !== null) {
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

    const valid = await onlyIdExamWithExistsValidator.validate(params)

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

    const newExamGrade = await ExamGrade.create({
      idExam: exam.idExam,
      idUser: user.idUser,
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

    await examService.startExam(user.idUser, exam.idExam, newExamGrade.idExamGrade, exam.time * 60)

    return this.buildJSONResponse({ message: 'Exam started', data: allData })
  }

  public async reTakeExam({ params, auth }: HttpContext) {
    const user = await auth.authenticate()

    if (user.accountType !== 'student') {
      throw new UnauthorizedException('Only students can start an exam')
    }

    const valid = await onlyIdExamWithExistsValidator.validate(params)

    const existingPendingExamGrade = await ExamGrade.query()
      .where('id_exam', valid.idExam)
      .andWhere('id_user', user.idUser)
      .where('status', 'en cours')
      .first()

    if (!existingPendingExamGrade) {
      throw new UnauthorizedException("You don't have any pending exam of this type")
    }

    const exam = await Exam.findOrFail(valid.idExam)

    const currentExamSessionData = examService.getRemainingTime(user.idUser, valid.idExam)
    if (!currentExamSessionData) {
      throw new ClientAccessibleException(
        'No active exam session found. Please start the exam again.'
      )
    }

    if (currentExamSessionData.remainingInSecondes < 30) {
      await examService.stopExam(user.idUser, valid.idExam)
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

    const valid = await onlyIdExamWithExistsValidator.validate(params)

    const res = await examService.stopExam(user.idUser, valid.idExam)

    if ('error' in res) {
      throw new ClientAccessibleException(res.message)
    }

    return this.buildJSONResponse({
      message: 'Exam stopped successfully',
    })
  }

  public async recap({ params, auth }: HttpContext) {
    const valid = await idStudentAndIdExamWithExistsValidator.validate(params)
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
      .andWhereNot('status', 'en cours')
      .first()

    if (!examGrade) {
      throw new ClientAccessibleException("You don't have any completed exam of this type")
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
      examGrade: examGrade.toJSON(),
    }

    return this.buildJSONResponse({ data: recap })
  }
}
