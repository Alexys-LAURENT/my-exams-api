import ClientAccessibleException from '#exceptions/client_accessible_exception'
import UnauthorizedException from '#exceptions/un_authorized_exception'
import ExamGrade from '#models/exam_grade'
import Question from '#models/question'
import UserResponse from '#models/user_response'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import AbstractController from '../abstract_controller.js'
import {
  checkCustomOrNotValidator,
  createUsersResponseValidator,
  onlyIdClassWithExistsValidator,
  updateUsersResponseValidator,
} from './validator.js'

export default class UsersResponsesController extends AbstractController {
  constructor() {
    super()
  }
  public async createUsersResponse({ auth, request }: HttpContext) {
    const user = await auth.authenticate()

    if (user.accountType !== 'student') {
      throw new UnauthorizedException()
    }

    const content = await createUsersResponseValidator.validate(request.body())

    const pendingExamGrade = await ExamGrade.query()
      .where('id_exam', content.idExam)
      .andWhere('id_user', user.idUser)
      .andWhere('id_class', content.idClass)
      .andWhere('status', 'en cours')
      .first()

    // On regarde si l'utilisateur est bien en train de passer l'examen
    if (!pendingExamGrade) {
      throw new ClientAccessibleException("You don't have any pending exam of this type")
    }

    const checkedAnswers = await checkCustomOrNotValidator.validate(request.body(), {
      meta: { idExam: content.idExam, idQuestion: content.idQuestion },
    })
    const custom = checkedAnswers.custom ? checkedAnswers.custom.trim() : null
    const answers = checkedAnswers.answers.filter((a) => a !== null && a !== undefined) as number[]

    if (answers.length > 0 && custom) {
      throw new Error('You can only send a custom answer or answers from the list, not both')
    }

    const question = await Question.findOrFail(content.idQuestion)

    if (answers.length === 0 && question.isQcm) {
      throw new Error('This question is a QCM, you have to send at least one possible answer')
    }

    if (answers.length > 0 && !question.isQcm) {
      throw new Error('This question is not a QCM, you can only send a custom answer')
    }

    if (answers.length > 1 && !question.isMultiple) {
      throw new Error('This question is not multiple, you can only send one answer')
    }

    const { userResponse, userResponseAnswers } = await db.transaction(async (trx) => {
      const theUserResponse = await UserResponse.create(
        {
          custom: checkedAnswers.custom ? checkedAnswers.custom : null,
          idUser: user.idUser,
          idQuestion: content.idQuestion,
          idExam: content.idExam,
        },
        { client: trx }
      )

      const userResponseAnswersRows: {
        id_answer: number
        id_user_response: number
        id_question: number
        id_exam: number
      }[] = []

      if (answers.length > 0) {
        answers.forEach((idAnswer) =>
          userResponseAnswersRows.push({
            id_answer: idAnswer,
            id_user_response: theUserResponse.idUserResponse,
            id_question: content.idQuestion,
            id_exam: content.idExam,
          })
        )
        await trx.table('user_responses_answers').insert(userResponseAnswersRows)
      }

      return { userResponse: theUserResponse, userResponseAnswers: userResponseAnswersRows }
    })

    return this.buildJSONResponse({ data: { userResponse, userResponseAnswers } })
  }

  public async updateUsersResponse({ auth, request, params }: HttpContext) {
    const user = await auth.authenticate()

    if (user.accountType !== 'student') {
      throw new UnauthorizedException()
    }

    const validParams = await updateUsersResponseValidator.validate(params)
    const classData = await onlyIdClassWithExistsValidator.validate(request.body())

    const theUserResponse = await UserResponse.findOrFail(validParams.idUserResponse)

    const pendingExamGrade = await ExamGrade.query()
      .where('id_exam', theUserResponse.idExam)
      .andWhere('id_user', user.idUser)
      .andWhere('id_class', classData.idClass)
      .andWhere('status', 'en cours')
      .first()

    // On regarde si l'utilisateur est bien en train de passer l'examen
    if (!pendingExamGrade) {
      throw new ClientAccessibleException("You don't have any pending exam of this type")
    }

    const checkedAnswers = await checkCustomOrNotValidator.validate(request.body(), {
      meta: { idExam: theUserResponse.idExam, idQuestion: theUserResponse.idQuestion },
    })
    const custom = checkedAnswers.custom ? checkedAnswers.custom.trim() : null
    const answers = checkedAnswers.answers.filter((a) => a !== null && a !== undefined) as number[]

    if (answers.length > 0 && custom) {
      throw new Error('You can only send a custom answer or answers from the list, not both')
    }

    const question = await Question.findOrFail(theUserResponse.idQuestion)

    if (answers.length === 0 && question.isQcm) {
      throw new Error('This question is a QCM, you have to send at least one possible answer')
    }

    if (answers.length > 0 && !question.isQcm) {
      throw new Error('This question is not a QCM, you can only send a custom answer')
    }

    if (answers.length > 1 && !question.isMultiple) {
      throw new Error('This question is not multiple, you can only send one answer')
    }

    const { userResponse, userResponseAnswers } = await db.transaction(async (trx) => {
      theUserResponse.custom = checkedAnswers.custom ? checkedAnswers.custom : null
      await theUserResponse.useTransaction(trx).save()

      await trx
        .from('user_responses_answers')
        .where('id_user_response', theUserResponse.idUserResponse)
        .delete()

      const userResponseAnswersRows: {
        id_answer: number
        id_user_response: number
        id_question: number
        id_exam: number
      }[] = []

      if (answers.length > 0) {
        answers.forEach((idAnswer) =>
          userResponseAnswersRows.push({
            id_answer: idAnswer,
            id_user_response: theUserResponse.idUserResponse,
            id_question: theUserResponse.idQuestion,
            id_exam: theUserResponse.idExam,
          })
        )
        await trx.table('user_responses_answers').insert(userResponseAnswersRows)
      }

      return { userResponse: theUserResponse, userResponseAnswers: userResponseAnswersRows }
    })

    return this.buildJSONResponse({ data: { userResponse, userResponseAnswers } })
  }
}
