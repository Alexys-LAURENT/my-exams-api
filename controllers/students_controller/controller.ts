import Class from '#models/class'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import { onlyIdClassWithExistsValidator, classStudentParamsValidator, createStudentValidator } from './validator.js'
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
  public async getAll(){
    const students = await User.query().where('account_type', 'student')
    return this.buildJSONResponse({data: students})
  }
}
