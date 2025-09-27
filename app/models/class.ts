import Degree from '#models/degree'
import Exam from '#models/exam'
import User from '#models/user'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Class extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_class' })
  declare idClass: number

  @column.dateTime({ columnName: 'start_date' })
  declare startDate: DateTime

  @column.dateTime({ columnName: 'end_date' })
  declare endDate: DateTime | null

  @column({ columnName: 'id_degree' })
  declare idDegree: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @belongsTo(() => Degree, {
    foreignKey: 'idDegree',
  })
  declare degree: BelongsTo<typeof Degree>

  @hasMany(() => Exam, {
    foreignKey: 'idClass',
  })
  declare exams: HasMany<typeof Exam>

  @manyToMany(() => User, {
    pivotTable: 'user_classes',
    localKey: 'idClass',
    pivotForeignKey: 'id_class',
    relatedKey: 'idUser',
    pivotRelatedForeignKey: 'id_user',
    pivotColumns: ['relation_type'],
  })
  declare users: ManyToMany<typeof User>
}
