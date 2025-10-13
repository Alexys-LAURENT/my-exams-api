import Exam from '#models/exam'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
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

  // You have to know that this relation exists but we can't define the hasMany here beacause the Question model has a composite primary key (idQuestion, idExam)
  // @hasMany(() => Answer, {
  //   foreignKey: 'idQuestion',
  // })
  // declare answers: HasMany<typeof Answer>

  // You have to know that this relation exists but we can't define the hasMany here beacause the Question model has a composite primary key (idQuestion, idExam)
  // @hasMany(() => UserResponse, {
  //   foreignKey: 'idQuestion',
  // })
  // declare userResponses: HasMany<typeof UserResponse>
}
