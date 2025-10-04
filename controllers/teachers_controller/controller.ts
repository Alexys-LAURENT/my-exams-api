import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'

export default class TeachersController extends AbstractController {
  constructor() {
    super()
  }

  public async getAll({}: HttpContext) {
    const teachers = await User.findBy('account_type', 'teacher')
    return this.buildJSONResponse({ data: teachers })
  }
}
