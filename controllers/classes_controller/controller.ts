import UnauthorizedException from '#exceptions/un_authorized_exception'
import Class from '#models/class'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import {
  DeleteClassValidator,
  limitQueryValidator,
  onlyIdClassWithExistsValidator,
  onlyIdStudentWithExistsValidator,
  onlyIdTeacherWithExistsValidator,
} from './validator.js'

export default class ClassesController extends AbstractController {
  constructor() {
    super()
  }

  /**
   * Get one class
   */
  public async getOneClass({ params }: HttpContext) {
    const valid = await onlyIdClassWithExistsValidator.validate(params)
    const theClass = await Class.findOrFail(valid.idClass)
    return this.buildJSONResponse({
      data: theClass,
    })
  }

  public async getAll({}: HttpContext) {
    const classes = await Class.all()
    return this.buildJSONResponse({ data: classes })
  }

  public async deleteIdClass({ params, auth }: HttpContext) {
    // Vérifier que l'utilisateur est bien connecté
    const user = auth.user

    if (!user || user.accountType !== 'admin') {
      throw new UnauthorizedException('Seuls les admins peuvent supprimer une classe.')
    }

    const valid = await DeleteClassValidator.validate(params)
    const theClass = await Class.findOrFail(valid.idClass)
    await theClass.delete()

    return this.buildJSONResponse({
      message: 'Class deleted successfully',
    })
  }

  public async getStudentClasses({ params }: HttpContext) {
    const valid = await onlyIdStudentWithExistsValidator.validate(params)
    const user = await User.findOrFail(valid.idStudent)
    const classes = await user.related('studentClasses').query()
    return this.buildJSONResponse({ data: classes })
  }

  public async getAllClassesForOneTeacher({ params, request }: HttpContext) {
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const theTeacher = await User.findOrFail(valid.idTeacher)
    const { limit } = await limitQueryValidator.validate(request.qs())
    const query = theTeacher.related('teacherClasses').query().orderBy('start_date', 'desc')
    if (limit) {
      query.limit(limit)
    }
    const classes = await query
    return this.buildJSONResponse({
      data: classes,
    })
  }
}
