import Question from '#models/question'
import Response from '#models/response'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Answer extends BaseModel {
  @column({ isPrimary: true })
  declare idAnswer: number

  @column()
  declare answer: string

  @column()
  declare isCorrect: boolean

  @column()
  declare idQuestion: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Question, {
    foreignKey: 'idQuestion',
  })
  declare question: BelongsTo<typeof Question>

  @hasMany(() => Response, {
    foreignKey: 'idAnswer',
  })
  declare responses: HasMany<typeof Response>
}
