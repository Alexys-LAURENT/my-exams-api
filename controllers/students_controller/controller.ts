import AbstractController from '../abstract_controller.js'
import User from '../../app/models/user.js'
import { HttpContext } from '@adonisjs/core/http'
import { onlyIdStudentWithExistsValidator } from './validator.js'

export default class StudentsController extends AbstractController {
  constructor() {
    super()
  }
  
  public async getStudentClasses({ params }: HttpContext) {
    const valid = await onlyIdStudentWithExistsValidator.validate(params)
    const user = await User.findOrFail(valid.idStudent)
    const classes = await user.related('studentClasses').query()
    return this.buildJSONResponse({ data: classes })
  }
}




