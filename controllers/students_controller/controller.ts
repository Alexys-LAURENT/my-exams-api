import AbstractController from '../abstract_controller.js'
import User from '../../app/models/user.js'
import { HttpContext } from '@adonisjs/core/http'

export default class StudentsController extends AbstractController {
  constructor() {
    super()
  }
  
  public async getStudentClass({ params }: HttpContext) {
    const { idStudent } = params
    
    const user = await User.findOrFail(idStudent)
    const classes = await user.related('studentClasses').query()
    return this.buildJSONResponse({ data: classes })
  }
}




