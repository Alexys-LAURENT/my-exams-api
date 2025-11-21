import UnauthorizedException from '#exceptions/un_authorized_exception'
import Class from '#models/class'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import {
  classTeacherAssociationValidator,
  classTeacherParamsValidator,
  createTeacherValidator,
  onlyIdTeacherWithExistsValidator,
  updateTeacherValidator,
} from './validator.js'

export default class TeachersController extends AbstractController {
  constructor() {
    super()
  }

  public async removeTeacherFromClass({ params, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      throw new UnauthorizedException(
        "Seuls les administrateurs peuvent retirer un professeur d'une classe"
      )
    }

    // Valider les paramètres
    const validatedParams = await classTeacherAssociationValidator.validate(params)
    const { idClass, idTeacher } = validatedParams

    const classInstance = await Class.findOrFail(idClass)

    await classInstance.related('teachers').detach([idTeacher])

    return this.buildJSONResponse({
      message: 'Professeur retiré de la classe avec succès',
    })
  }

  public async putTeacherToClass({ params, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent ajouter un professeur à une classe'
      )
    }
    const validatedParams = await classTeacherParamsValidator.validate(params)
    const { idClass, idTeacher } = validatedParams
    const classInstance = await Class.findOrFail(idClass)
    await classInstance.related('teachers').attach([idTeacher])
    return this.buildJSONResponse({ message: 'Professeur associé à la classe avec succès' })
  }

  public async updateTeacher({ request, params }: HttpContext) {
    const content = await updateTeacherValidator.validate(request.body())
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const teacher = await User.findOrFail(valid.idTeacher)

    if (content.lastName) teacher.lastName = content.lastName
    if (content.name) teacher.name = content.name
    if (content.email) teacher.email = content.email
    if (content.avatarPath) teacher.avatarPath = content.avatarPath

    await teacher.save()

    return this.buildJSONResponse({ data: teacher })
  }

  public async deleteTeacher({ params }: HttpContext) {
    const teacher = await onlyIdTeacherWithExistsValidator.validate(params)
    await User.query().where('id_user', teacher.idTeacher).delete()
    return this.buildJSONResponse({ message: 'Teacher deleted successfully' })
  }

  public async createTeacher({ request }: HttpContext) {
    const content = await createTeacherValidator.validate(request.body())
    const teacher = await User.create({
      lastName: content.lastName,
      name: content.name,
      email: content.email,
      password: content.password,
      avatarPath: content.avatarPath ?? null,
      accountType: 'teacher',
    })
    return this.buildJSONResponse({ data: teacher })
  }

  public async getOneTeacher({ params }: HttpContext) {
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const theTeacher = await User.findOrFail(valid.idTeacher)
    return this.buildJSONResponse({
      data: theTeacher,
    })
  }

  public async getAll() {
    const teachers = await User.query().where('account_type', 'teacher')
    return this.buildJSONResponse({ data: teachers })
  }

  /**
   * Récupère les matières d'un enseignant
   */
  public async getMatieres({ params }: HttpContext) {
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const teacher = await User.findOrFail(valid.idTeacher)
    const matieres = await teacher.related('matieres').query()
    return this.buildJSONResponse({ data: matieres })
  }
}
