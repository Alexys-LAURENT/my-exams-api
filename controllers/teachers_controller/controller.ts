import UnauthorizedException from '#exceptions/un_authorized_exception'
import Class from '#models/class'
import Exam from '#models/exam'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import AbstractController from '../abstract_controller.js'
import {
  activeExamsQueryValidator,
  classTeacherAssociationValidator,
  classTeacherParamsValidator,
  createTeacherValidator,
  onlyIdClassWithExistsValidator,
  onlyIdTeacherWithExistsValidator,
  paginateWithFilterValidator,
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

    if (content.matiereIds && content.matiereIds.length > 0) {
      await teacher.related('matieres').attach(content.matiereIds)
    }

    return this.buildJSONResponse({ data: teacher })
  }

  public async getOneTeacher({ params }: HttpContext) {
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const theTeacher = await User.findOrFail(valid.idTeacher)
    return this.buildJSONResponse({
      data: theTeacher,
    })
  }

  public async getAll({ request }: HttpContext) {
    const validParams = await paginateWithFilterValidator.validate(request.qs())
    const query = User.query().where('account_type', 'teacher')

    if (validParams.filter) {
      query.andWhere((q) => {
        q.where('name', 'like', `%${validParams.filter}%`)
          .orWhere('last_name', 'like', `%${validParams.filter}%`)
          .orWhere('email', 'like', `%${validParams.filter}%`)
      })
    }

    const teachers = await query.paginate(validParams.page, 20)
    return this.buildJSONResponse({ data: teachers })
  }

  public async getAllCount() {
    const users = await db.from('users').where('account_type', 'teacher').count('* as total')
    return this.buildJSONResponse({ data: Number.parseInt(users[0].total) })
  }

  public async getTeachersOfClass({ params }: HttpContext) {
    const valid = await onlyIdClassWithExistsValidator.validate(params)
    const theClass = await Class.findOrFail(valid.idClass)

    const teachers = await theClass.related('teachers').query()

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

  /**
   * Récupère les examens actifs d'un enseignant (ExamClass[])
   * Actif = en cours (start_date <= now <= end_date) OU à venir (start_date > now)
   * Retourne uniquement les données de la table pivot exams_classes
   */
  public async getActiveExamsForOneTeacher({ params, request }: HttpContext) {
    const valid = await onlyIdTeacherWithExistsValidator.validate(params)
    const queryParams = await activeExamsQueryValidator.validate(request.qs())

    // Récupérer tous les examens du professeur
    const exams = await Exam.query().where('id_teacher', valid.idTeacher)

    const now = DateTime.now()
    const activeExamClasses: Array<{
      idExam: number
      idClass: number
      start_date: string
      end_date: string
    }> = []

    for (const exam of exams) {
      // Charger les classes avec les dates du pivot
      const classes = await exam.related('classes').query().pivotColumns(['start_date', 'end_date'])

      // Filtrer les classes actives (en cours ou à venir)
      for (const classItem of classes) {
        const startDate = classItem.$extras.pivot_start_date
        const endDate = classItem.$extras.pivot_end_date

        if (!startDate || !endDate) continue

        const start = DateTime.fromJSDate(startDate)
        const end = DateTime.fromJSDate(endDate)

        // En cours (start_date <= now <= end_date) OU à venir (start_date > now)
        if ((start <= now && end >= now) || start > now) {
          activeExamClasses.push({
            idExam: exam.idExam,
            idClass: classItem.idClass,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          })
        }
      }
    }

    // Trier par date de début prochaine (ascendant) - tri global par start_date
    activeExamClasses.sort((a, b) => Date.parse(a.start_date) - Date.parse(b.start_date))

    // Appliquer la limite si fournie
    const limitedExamClasses = queryParams.limit
      ? activeExamClasses.slice(0, queryParams.limit)
      : activeExamClasses

    console.log('limitedExamClasses', limitedExamClasses)

    return this.buildJSONResponse({ data: limitedExamClasses })
  }
}
