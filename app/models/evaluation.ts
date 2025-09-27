import Exam from '#models/exam'
import Response from '#models/response'
import User from '#models/user'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Evaluation extends BaseModel {
  @column({ isPrimary: true })
  declare idEvaluation: number

  @column()
  declare note: number | null

  @column()
  declare idExam: number

  @column()
  declare idUser: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Exam, {
    foreignKey: 'idExam',
  })
  declare exam: BelongsTo<typeof Exam>

  @belongsTo(() => User, {
    foreignKey: 'idUser',
  })
  declare user: BelongsTo<typeof User>

  @hasMany(() => Response, {
    foreignKey: 'idEvaluation',
  })
  declare responses: HasMany<typeof Response>
}
