import Answer from '#models/answer'
import Evaluation from '#models/evaluation'
import Question from '#models/question'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Response extends BaseModel {
  @column({ isPrimary: true })
  declare idResponse: number

  @column()
  declare custom: string | null

  @column()
  declare idEvaluation: number

  @column()
  declare idQuestion: number

  @column()
  declare idAnswer: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Evaluation, {
    foreignKey: 'idEvaluation',
  })
  declare evaluation: BelongsTo<typeof Evaluation>

  @belongsTo(() => Question, {
    foreignKey: 'idQuestion',
  })
  declare question: BelongsTo<typeof Question>

  @belongsTo(() => Answer, {
    foreignKey: 'idAnswer',
  })
  declare answer: BelongsTo<typeof Answer>
}
