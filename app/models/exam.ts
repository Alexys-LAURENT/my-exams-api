import Class from '#models/class'
import Evaluation from '#models/evaluation'
import Question from '#models/question'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Exam extends BaseModel {
  @column({ isPrimary: true })
  declare idExam: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column.dateTime()
  declare time: DateTime

  @column()
  declare imagePath: string | null

  @column()
  declare idClass: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Class, {
    foreignKey: 'idClass',
  })
  declare class: BelongsTo<typeof Class>

  @hasMany(() => Question, {
    foreignKey: 'idExam',
  })
  declare questions: HasMany<typeof Question>

  @hasMany(() => Evaluation, {
    foreignKey: 'idExam',
  })
  declare evaluations: HasMany<typeof Evaluation>
}
