import Class from '#models/class'
import ExamGrade from '#models/exam_grade'
import Question from '#models/question'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from './user.js'

export default class Exam extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_exam' })
  declare idExam: number

  @column()
  declare title: string

  @column()
  declare desc: string | null

  @column()
  declare time: number

  @column()
  declare idTeacher: number

  @column({ columnName: 'image_path' })
  declare imagePath: string | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  // Relation many-to-many avec Class via la table pivot exams_classes
  @manyToMany(() => Class, {
    pivotTable: 'exams_classes',
    localKey: 'idExam',
    pivotForeignKey: 'id_exam',
    relatedKey: 'idClass',
    pivotRelatedForeignKey: 'id_class',
    pivotColumns: ['start_date', 'end_date'],
  })
  declare classes: ManyToMany<typeof Class>

  @hasMany(() => Question, {
    foreignKey: 'idExam',
  })
  declare questions: HasMany<typeof Question>

  @hasMany(() => ExamGrade, {
    foreignKey: 'idExam',
  })
  declare examGrades: HasMany<typeof ExamGrade>

  @belongsTo(() => User, {
    foreignKey: 'idTeacher',
    localKey: 'idUser',
  })
  declare teacher: BelongsTo<typeof User>
}
