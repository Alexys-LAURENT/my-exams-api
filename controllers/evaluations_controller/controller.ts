import UnAuthorizedException from '#exceptions/un_authorized_exception'
import Evaluation from '#models/evaluation'
import Exam from '#models/exam'
import Question from '#models/question'
import UserResponse from '#models/user_response'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { createEvaluationValidator, updateEvaluationValidator } from './validators.js'

export default class EvaluationsController extends AbstractController {
  constructor() {
    super()
  }

  public async createEvaluation({ request, auth }: HttpContext) {
    const user = await auth.authenticate()

    if (user.accountType !== 'teacher') {
      throw new UnAuthorizedException('Only teachers can create evaluations')
    }

    const valid = await createEvaluationValidator.validate(request.body())
    const theUserResponse = await UserResponse.findOrFail(valid.idUserResponse)
    const theExam = await Exam.findOrFail(theUserResponse.idExam)

    if (theExam.idTeacher !== user.idUser) {
      throw new UnAuthorizedException('You are not the teacher of this exam')
    }

    const existingEvaluation = await Evaluation.query()
      .where('id_user_response', theUserResponse.idUserResponse)
      .first()

    if (existingEvaluation) {
      throw new UnAuthorizedException('An evaluation for this user response already exists')
    }

    const question = await Question.query()
      .where('idQuestion', theUserResponse.idQuestion)
      .andWhere('idExam', theUserResponse.idExam)
      .firstOrFail()

    if (valid.note! > question.maxPoints) {
      throw new UnAuthorizedException(
        `The note cannot be higher than the max points of the question (${question.maxPoints})`
      )
    }

    const newEvaluation = await Evaluation.create({
      note: valid.note,
      idStudent: theUserResponse.idUser,
      idTeacher: user.idUser,
      idUserResponse: theUserResponse.idUserResponse,
      commentary: valid.commentary ?? null,
    })

    return this.buildJSONResponse({
      data: newEvaluation,
    })
  }

  public async updateEvaluation({ auth, params, request }: HttpContext) {
    const user = await auth.authenticate()

    if (user.accountType !== 'teacher') {
      throw new UnAuthorizedException('Only teachers can update evaluations')
    }

    const evaluation = await Evaluation.findOrFail(params.idEvaluation)

    if (evaluation.idTeacher !== user.idUser) {
      throw new UnAuthorizedException('You are not the teacher who created this evaluation')
    }

    const valid = await updateEvaluationValidator.validate(request.body())

    const userResponse = await UserResponse.findOrFail(evaluation.idUserResponse)
    const question = await Question.query()
      .where('idQuestion', userResponse.idQuestion)
      .andWhere('idExam', userResponse.idExam)
      .firstOrFail()

    if (valid.note! > question.maxPoints) {
      throw new UnAuthorizedException(
        `The note cannot be higher than the max points of the question (${question.maxPoints})`
      )
    }

    evaluation.note = valid.note

    if (valid.commentary !== undefined) {
      evaluation.commentary = valid.commentary
    }

    await evaluation.save()

    return this.buildJSONResponse({
      data: evaluation,
    })
  }
}
