import Answer from '#models/answer'
import Question from '#models/question'
import User from '#models/user'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class UserResponse extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_user_response' })
  declare idUserResponse: number

  @column()
  declare custom: string | null

  @column({ columnName: 'id_user' })
  declare idUser: number

  @column({ columnName: 'id_question' })
  declare idQuestion: number

  @column({ columnName: 'id_exam' })
  declare idExam: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, {
    foreignKey: 'idUser',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Question, {
    foreignKey: 'idQuestion',
  })
  declare question: BelongsTo<typeof Question>

  @manyToMany(() => Answer, {
    pivotTable: 'user_responses_answers',
    localKey: 'idUserResponse',
    pivotForeignKey: 'id_user_response',
    relatedKey: 'idAnswer',
    pivotRelatedForeignKey: 'id_answer',
  })
  declare answer: ManyToMany<typeof Answer>
}
