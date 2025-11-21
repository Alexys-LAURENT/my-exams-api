import UnauthorizedException from '#exceptions/un_authorized_exception'
import Matiere from '#models/matiere'
import type { HttpContext } from '@adonisjs/core/http'
import AbstractController from '../abstract_controller.js'
import {
  createMatiereValidator,
  onlyIdMatiereWithExistsValidator,
  teacherMatiereAssociationValidator,
  updateMatiereValidator,
} from './validator.js'

export default class MatieresController extends AbstractController {
  constructor() {
    super()
  }

  /**
   * Récupère toutes les matières
   */
  public async getAll() {
    const matieres = await Matiere.all()
    return this.buildJSONResponse({ data: matieres })
  }

  /**
   * Récupère une matière par son ID
   */
  public async getMatiereFromId({ params }: HttpContext) {
    const valid = await onlyIdMatiereWithExistsValidator.validate(params)
    const matiere = await Matiere.findOrFail(valid.idMatiere)
    return this.buildJSONResponse({ data: matiere })
  }

  /**
   * Crée une nouvelle matière
   */
  public async createMatiere({ request, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      throw new UnauthorizedException('Seuls les administrateurs peuvent créer une matière')
    }

    const content = await createMatiereValidator.validate(request.body())
    const matiere = await Matiere.create({
      nom: content.nom,
    })
    return this.buildJSONResponse({ data: matiere })
  }

  /**
   * Met à jour une matière
   */
  public async updateMatiere({ request, params, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      throw new UnauthorizedException('Seuls les administrateurs peuvent modifier une matière')
    }

    const content = await updateMatiereValidator.validate(request.body())
    const valid = await onlyIdMatiereWithExistsValidator.validate(params)
    const matiere = await Matiere.findOrFail(valid.idMatiere)

    if (content.nom) matiere.nom = content.nom

    await matiere.save()

    return this.buildJSONResponse({ data: matiere })
  }

  /**
   * Supprime une matière
   */
  public async deleteMatiere({ params, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      throw new UnauthorizedException('Seuls les administrateurs peuvent supprimer une matière')
    }

    const valid = await onlyIdMatiereWithExistsValidator.validate(params)
    await Matiere.query().where('id_matiere', valid.idMatiere).delete()
    return this.buildJSONResponse({ message: 'Matière supprimée avec succès' })
  }

  /**
   * Récupère les enseignants d'une matière
   */
  public async getTeachers({ params }: HttpContext) {
    const valid = await onlyIdMatiereWithExistsValidator.validate(params)
    const matiere = await Matiere.findOrFail(valid.idMatiere)
    const teachers = await matiere.related('teachers').query()
    return this.buildJSONResponse({ data: teachers })
  }

  /**
   * Ajoute un enseignant à une matière
   */
  public async addTeacherToMatiere({ params, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      throw new UnauthorizedException(
        'Seuls les administrateurs peuvent ajouter un enseignant à une matière'
      )
    }

    const validatedParams = await teacherMatiereAssociationValidator.validate(params)
    const { idMatiere, idTeacher } = validatedParams

    const matiere = await Matiere.findOrFail(idMatiere)
    await matiere.related('teachers').attach([idTeacher])

    return this.buildJSONResponse({ message: 'Enseignant associé à la matière avec succès' })
  }

  /**
   * Retire un enseignant d'une matière
   */
  public async removeTeacherFromMatiere({ params, auth }: HttpContext) {
    const user = auth.user
    if (!user || user.accountType !== 'admin') {
      throw new UnauthorizedException(
        "Seuls les administrateurs peuvent retirer un enseignant d'une matière"
      )
    }

    const validatedParams = await teacherMatiereAssociationValidator.validate(params)
    const { idMatiere, idTeacher } = validatedParams

    const matiere = await Matiere.findOrFail(idMatiere)
    await matiere.related('teachers').detach([idTeacher])

    return this.buildJSONResponse({ message: 'Enseignant retiré de la matière avec succès' })
  }
}
