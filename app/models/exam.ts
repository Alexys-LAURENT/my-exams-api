import Class from '#models/class'
import ExamGrade from '#models/exam_grade'
import Question from '#models/question'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Exam extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_exam' })
  declare idExam: number

  @column()
  declare title: string

  @column()
  declare desc: string | null

  @column.dateTime()
  declare time: DateTime

  @column({ columnName: 'image_path' })
  declare imagePath: string | null

  @column({ columnName: 'id_class' })
  declare idClass: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @belongsTo(() => Class, {
    foreignKey: 'idClass',
  })
  declare class: BelongsTo<typeof Class>

  @hasMany(() => Question, {
    foreignKey: 'idExam',
  })
  declare questions: HasMany<typeof Question>

  @hasMany(() => ExamGrade, {
    foreignKey: 'idExam',
  })
  declare examGrades: HasMany<typeof ExamGrade>
}
