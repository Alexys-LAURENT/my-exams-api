import Class from '#models/class'
import AbstractController from '../abstract_controller.js'
import { onlyIdClassWithExistsValidator } from '../classes_controller/validator.js'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }
  /*
  public async getExamsOfClass({ params, request, auth }: HttpContext) {
    const valid = await onlyIdClassWithExistsValidator.validate({ idClass: params.idClass })
    const theClass = await Class.findOrFail(valid.idClass)

    const status = request.qs().status as 'completed' | 'pending' | 'comming' | undefined
    const limit = request.qs().limit ? parseInt(request.qs().limit, 10) : undefined
    
    let examsQuery = theClass.related('exams').query()
    const userId = auth.user?.idUser

    const now = DateTime.now()
    
    if (status && userId) {
      if (status === 'completed') {

        examsQuery.whereExists(query => {
          query
            .from('exam_grades')
            .whereRaw('exam_grades.id_exam = exams.id_exam')
            .where('exam_grades.id_user', userId)
        })
      } else if (status === 'pending') {
        
        const isClassStarted = now >= theClass.startDate
        const isClassNotFinished = !theClass.endDate || now <= theClass.endDate
        
        if (isClassStarted && isClassNotFinished) {
          examsQuery.whereNotExists(query => {
            query
              .from('exam_grades')
              .whereRaw('exam_grades.id_exam = exams.id_exam')
              .where('exam_grades.id_user', userId)
          })
        } else {
          examsQuery.whereRaw('1 = 0') 
        }
      } else if (status === 'comming') {
        
        const isClassNotStartedYet = now < theClass.startDate
        
        if (isClassNotStartedYet) {
          examsQuery.whereNotExists(query => {
            query
              .from('exam_grades')
              .whereRaw('exam_grades.id_exam = exams.id_exam')
              .where('exam_grades.id_user', userId)
          })
        } else {
          
          examsQuery.whereRaw('1 = 0') 
        }
      }
    }

    if (limit) {
      examsQuery.limit(limit)
    }
    
    const exams = await examsQuery

    return this.buildJSONResponse({ data: exams })
  }
*/
}
