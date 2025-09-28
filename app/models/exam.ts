import Class from '#models/class'
import ExamGrade from '#models/exam_grade'
import Question from '#models/question'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
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
}
