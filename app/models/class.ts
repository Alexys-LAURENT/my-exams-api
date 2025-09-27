import Exam from '#models/exam'
import Promotion from '#models/promotion'
import User from '#models/user'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Class extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_class' })
  declare idClass: number

  @column.dateTime({ columnName: 'creation_date' })
  declare creationDate: DateTime

  @column({ columnName: 'id_promotion' })
  declare idPromotion: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @belongsTo(() => Promotion, {
    foreignKey: 'id_promotion',
  })
  declare promotion: BelongsTo<typeof Promotion>

  @hasMany(() => Exam, {
    foreignKey: 'id_class',
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
