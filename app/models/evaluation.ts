import ExamGrade from '#models/exam_grade'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Evaluation extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_evaluation' })
  declare idEvaluation: number

  @column()
  declare note: number | null

  @column({ columnName: 'id_exam_grade' })
  declare idExamGrade: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @belongsTo(() => ExamGrade, {
    foreignKey: 'idExamGrade',
  })
  declare examGrade: BelongsTo<typeof ExamGrade>
}
