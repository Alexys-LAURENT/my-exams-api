import { BaseModel, column } from '@adonisjs/lucid/orm'
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

  // You have to know that this relation exists but we can't define the belongsTo here beacause the Question model has a composite primary key (idQuestion, idExam)
  // @belongsTo(() => Question, {
  //   foreignKey: 'idQuestion',
  // })
  // declare question: BelongsTo<typeof Question>

  // You have to know that this relation exists but we can't define the manyToMany here beacause the Answer model has a composite primary key (idAnswer, idQuestion, idExam)
  // @manyToMany(() => UserResponse, {
  //   pivotTable: 'user_responses_answers',
  //   localKey: 'idAnswer',
  //   pivotForeignKey: 'id_answer',
  //   relatedKey: 'idUserResponse',
  //   pivotRelatedForeignKey: 'id_user_response',
  // })
  // declare userResponses: ManyToMany<typeof UserResponse>
}
