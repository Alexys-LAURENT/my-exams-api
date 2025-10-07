import Class from '#models/class'
import AbstractController from '../abstract_controller.js'
import { getExamsOfClassParamsValidator, getExamsOfClassQueryValidator } from './validator.js'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }
  
  public async getExamsOfClass({ params, request, auth }: HttpContext) {

    const validParams = await getExamsOfClassParamsValidator.validate({ idClass: params.idClass })
    const theClass = await Class.findOrFail(validParams.idClass)

    const allowedQueryParams = ['status', 'limit']
    const queryKeys = Object.keys(request.qs())
    const invalidParams = queryKeys.filter(key => !allowedQueryParams.includes(key))
    
    if (invalidParams.length > 0) {
      return this.buildJSONResponse({
        success: false,
        message: `Paramètres de requête invalides : ${invalidParams.join(', ')}.`
      })
    }

    const validQuery = await getExamsOfClassQueryValidator.validate({
      status: request.qs().status,
      limit: request.qs().limit
    })

    const status = validQuery.status as 'completed' | 'pending' | 'comming' | undefined
    const limit = validQuery.limit ? parseInt(validQuery.limit, 10) : undefined

    const validStatuses = ['completed', 'pending', 'comming']
    if (status && !validStatuses.includes(status)) {
      return this.buildJSONResponse({
        success: false,
        message: `Statut invalide. Les statuts autorisés sont : ${validStatuses.join(', ')}`
      })
    }

    if (validQuery.limit !== undefined) {
      const numLimit = parseFloat(validQuery.limit)
      if (isNaN(numLimit) || !Number.isInteger(numLimit) || numLimit <= 0) {
        return this.buildJSONResponse({
          success: false,
          message: "La limite doit être un nombre entier positif"
        })
      }
    }
    
    let examsQuery = theClass.related('exams').query().pivotColumns(['start_date', 'end_date'])
    const userId = auth.user?.idUser
    const today = DateTime.now().toSQL()

    if (status && userId) {
      if (status === 'completed') {

        examsQuery.whereExists(query => {
          query
            .from('exam_grades')
            .whereRaw('exam_grades.id_exam = exams.id_exam')
            .where('exam_grades.id_user', userId)
        })
      } else if (status === 'pending') {

        examsQuery
          .wherePivot('start_date', '<=', today)
          .wherePivot('end_date', '>=', today)
          .whereNotExists(query => {
            query
              .from('exam_grades')
              .whereRaw('exam_grades.id_exam = exams.id_exam')
              .where('exam_grades.id_user', userId)
          })
      } else if (status === 'comming') {

        examsQuery
          .wherePivot('start_date', '>', today)
          .whereNotExists(query => {
            query
              .from('exam_grades')
              .whereRaw('exam_grades.id_exam = exams.id_exam')
              .where('exam_grades.id_user', userId)
          })
      }
    }

    if (limit) {
      examsQuery.limit(limit)
    }
    
    const exams = await examsQuery
    
    return this.buildJSONResponse({ data: exams })
  }
}
