import Answer from '#models/answer'
import Exam from '#models/exam'
import Response from '#models/response'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Question extends BaseModel {
  @column({ isPrimary: true })
  declare idQuestion: number

  @column()
  declare title: string

  @column()
  declare commentary: string | null

  @column()
  declare isMultiple: boolean

  @column()
  declare isQcm: boolean

  @column()
  declare maxPoints: number

  @column()
  declare idExam: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Exam, {
    foreignKey: 'idExam',
  })
  declare exam: BelongsTo<typeof Exam>

  @hasMany(() => Answer, {
    foreignKey: 'idQuestion',
  })
  declare answers: HasMany<typeof Answer>

  @hasMany(() => Response, {
    foreignKey: 'idQuestion',
  })
  declare responses: HasMany<typeof Response>
}
