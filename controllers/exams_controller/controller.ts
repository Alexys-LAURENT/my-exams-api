import Class from '#models/class'
import AbstractController from '../abstract_controller.js'
import { onlyIdClassWithExistsValidator } from '../classes_controller/validator.js'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class ExamsController extends AbstractController {
  constructor() {
    super()
  }
  
}
