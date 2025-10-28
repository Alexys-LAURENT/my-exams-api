import Exam from '#models/exam'
import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Class from './class.js'

export default class ExamGrade extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_exam_grade' })
  declare idExamGrade: number

  @column()
  declare note: number | null

  @column()
  declare status: 'en cours' | 'à corrigé' | 'corrigé'

  @column({ columnName: 'id_user' })
  declare idUser: number

  @column({ columnName: 'id_exam' })
  declare idExam: number

  @column({ columnName: 'id_class' })
  declare idClass: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, {
    foreignKey: 'idUser',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Exam, {
    foreignKey: 'idExam',
  })
  declare exam: BelongsTo<typeof Exam>

  @belongsTo(() => Class, {
    foreignKey: 'idClass',
  })
  declare class: BelongsTo<typeof Class>
}
