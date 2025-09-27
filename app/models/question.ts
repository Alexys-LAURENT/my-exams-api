import Answer from '#models/answer'
import Exam from '#models/exam'
import UserResponse from '#models/user_response'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Question extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_question' })
  declare idQuestion: number

  @column()
  declare title: string

  @column()
  declare commentary: string | null

  @column({ columnName: 'is_multiple' })
  declare isMultiple: boolean

  @column({ columnName: 'is_qcm' })
  declare isQcm: boolean

  @column({ columnName: 'max_points' })
  declare maxPoints: number

  @column({ columnName: 'id_exam' })
  declare idExam: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @belongsTo(() => Exam, {
    foreignKey: 'idExam',
  })
  declare exam: BelongsTo<typeof Exam>

  @hasMany(() => Answer, {
    foreignKey: 'idQuestion',
  })
  declare answers: HasMany<typeof Answer>

  @hasMany(() => UserResponse, {
    foreignKey: 'idQuestion',
  })
  declare userResponses: HasMany<typeof UserResponse>
}
