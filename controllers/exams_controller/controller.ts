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

    const validParams = await getExamsOfClassParamsValidator.validate(params)

    const theClass = await Class.findOrFail(validParams.idClass)

    const validQuery = await getExamsOfClassQueryValidator.validate(request.qs())

    const { status, limit } = validQuery
    
    let examsQuery = theClass.related('exams').query().pivotColumns(['start_date', 'end_date'])

    const user = await auth.authenticate()

    const userId = user.idUser

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

   
    if (limit !== null) {
      examsQuery.limit(limit)
    }
    
    const exams = await examsQuery
    
    const serializedExams = exams.map((exam) => {
      return {
        ...exam.toJSON(),

        start_date: exam.$extras.pivot_start_date,
        end_date: exam.$extras.pivot_end_date
      }
    })
    
    return this.buildJSONResponse({ data: serializedExams })
  }
}
