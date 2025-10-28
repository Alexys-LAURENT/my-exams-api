import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import AbstractController from '../abstract_controller.js'
import { onlyIdExamAndIdClassWithExistsValidator } from './validators.js'

export default class ExamsClassesController extends AbstractController {
  constructor() {
    super()
  }

  public async getExamClassRelation({ params }: HttpContext) {
    const validParams = await onlyIdExamAndIdClassWithExistsValidator.validate(params)
    const relationExamClass = (await db
      .from('exams_classes')
      .where({
        id_exam: validParams.idExam,
        id_class: validParams.idClass,
      })
      .firstOrFail()) as { id_exam: number; id_class: number; start_date: Date; end_date: Date }

    return this.buildJSONResponse({ data: relationExamClass })
  }
}
