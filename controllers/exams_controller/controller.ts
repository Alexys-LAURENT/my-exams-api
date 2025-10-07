import Class from '#models/class'
import AbstractController from '../abstract_controller.js'
import { getExamsOfClassParamsValidator } from './validator.js'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }
  
  /**
   * Récupère les examens d'une classe avec possibilité de filtrage par status et limite
   * 
   * @param params
   * @param request 
   * @param auth 
   */
  public async getExamsOfClass({ params, request, auth }: HttpContext) {

    const valid = await getExamsOfClassParamsValidator.validate({ idClass: params.idClass })
    const theClass = await Class.findOrFail(valid.idClass)

    const status = request.qs().status as 'completed' | 'pending' | 'comming' | undefined
    const limit = request.qs().limit ? parseInt(request.qs().limit, 10) : undefined
    
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
