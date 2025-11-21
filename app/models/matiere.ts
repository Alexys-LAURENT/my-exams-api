import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Exam from './exam.js'
import User from './user.js'

export default class Matiere extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_matiere' })
  declare idMatiere: number

  @column()
  declare nom: string

  @hasMany(() => Exam, {
    foreignKey: 'idMatiere',
  })
  declare exams: HasMany<typeof Exam>

  @manyToMany(() => User, {
    pivotTable: 'teacher_matieres',
    localKey: 'idMatiere',
    pivotForeignKey: 'id_teacher',
    relatedKey: 'idUser',
    pivotRelatedForeignKey: 'id_teacher',
  })
  declare teachers: ManyToMany<typeof User>
}
