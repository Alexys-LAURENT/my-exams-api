import Question from '#models/question'
import UserResponse from '#models/user_response'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Answer extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_answer' })
  declare idAnswer: number

  @column()
  declare answer: string

  @column({ columnName: 'is_correct' })
  declare isCorrect: boolean

  @column({ columnName: 'id_question' })
  declare idQuestion: number

  @column({ columnName: 'id_exam' })
  declare idExam: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @belongsTo(() => Question, {
    foreignKey: 'idQuestion',
  })
  declare question: BelongsTo<typeof Question>

  @manyToMany(() => UserResponse, {
    pivotTable: 'user_responses_answers',
    localKey: 'idAnswer',
    pivotForeignKey: 'id_answer',
    relatedKey: 'idUserResponse',
    pivotRelatedForeignKey: 'id_user_response',
  })
  declare userResponses: ManyToMany<typeof UserResponse>
}
