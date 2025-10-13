import Class from '#models/class'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdStudentWithExistsValidator } from '../classes_controller/validator.js'
import { onlyIdClassWithExistsValidator, classStudentParamsValidator, createStudentValidator, updateStudentValidator } from './validator.js'
import type { HttpContext } from '@adonisjs/core/http'
import UnAuthorizedException from '#exceptions/un_authorized_exception'


export default class StudentsController extends AbstractController {
  constructor() {
    super()
  }
  public async createStudent({ request }: HttpContext) {
    const content = await createStudentValidator.validate(request.body())
    const student = await User.create({
      lastName: content.lastName,
      name: content.name,
      email: content.email,
      password: content.password,
      avatarPath: content.avatarPath ?? null,
      accountType: 'student',
    })
    return this.buildJSONResponse({ data: student })
  }

  public async deleteStudent({ params }: HttpContext) {
    const student = await onlyIdStudentWithExistsValidator.validate(params)
    await User.query().where('id_user', student.idStudent).delete()
    return this.buildJSONResponse({ message: 'Student deleted successfully' })
  }
  
  public async updateStudent({ request, params }: HttpContext) {
    const content = await updateStudentValidator.validate(request.body())
    const valid = await onlyIdStudentWithExistsValidator.validate(params)
    const student = await User.findOrFail(valid.idStudent)

    if (content.lastName) student.lastName = content.lastName
    if (content.name) student.name = content.name
    if (content.email) student.email = content.email
    if (content.avatarPath) student.avatarPath = content.avatarPath

    await student.save()

    return this.buildJSONResponse({ data: student })
  }

  public async getStudentsOfClass({ params }: HttpContext) {
    const valid = await onlyIdClassWithExistsValidator.validate(params)
    const theClass = await Class.findOrFail(valid.idClass)

    const students = await theClass.related('students').query()

    return this.buildJSONResponse({ data: students })
  }

  public async putStudentToClass({ params, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      throw new UnAuthorizedException('Seuls les administrateurs peuvent associer un étudiant à une classe')
    }

    const validatedParams = await classStudentParamsValidator.validate(params)
    const { idClass, idStudent } = validatedParams

    const classInstance = await Class.findOrFail(idClass)
    
    await classInstance.related('students').attach([idStudent])

    return this.buildJSONResponse({
      message: 'Étudiant associé à la classe avec succès'
    })
  }
  
  public async deleteStudentFromClass({ params, auth }: HttpContext) { 
    const user = auth.user
    if (!user || user.accountType !== 'admin') { 
      throw new UnAuthorizedException('Seuls les administrateurs peuvent désassocier un étudiant d\'une classe')
    }
    
    const validatedParams = await classStudentParamsValidator.validate(params) 
    const { idClass, idStudent } = validatedParams
    
    const classInstance = await Class.findOrFail(idClass)
    
    await classInstance.related('students').detach([idStudent])
    
    return this.buildJSONResponse({ 
      message: 'Étudiant désassocié de la classe avec succès' 
    }) 
  }

}
