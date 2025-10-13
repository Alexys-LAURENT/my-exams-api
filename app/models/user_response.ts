import User from '#models/user'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Evaluation from './evaluation.js'

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

  // You have to know that this relation exists but we can't define the belongsTo here beacause the Question model has a composite primary key (idQuestion, idExam)
  // @belongsTo(() => Question, {
  //   foreignKey: 'idQuestion',
  // })
  // declare question: BelongsTo<typeof Question>

  // You have to know that this relation exists but we can't define the manyToMany here beacause the Answer model has a composite primary key (idAnswer, idQuestion, idExam)
  // @manyToMany(() => Answer, {
  //   pivotTable: 'user_responses_answers',
  //   localKey: 'idUserResponse',
  //   pivotForeignKey: 'id_user_response',
  //   relatedKey: 'idAnswer',
  //   pivotRelatedForeignKey: 'id_answer',
  // })
  // declare answer: ManyToMany<typeof Answer>

  @hasMany(() => Evaluation, {
    foreignKey: 'idUserResponse',
  })
  declare evaluations: HasMany<typeof Evaluation>
}
