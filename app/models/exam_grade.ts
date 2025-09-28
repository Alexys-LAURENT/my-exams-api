import Evaluation from '#models/evaluation'
import Exam from '#models/exam'
import User from '#models/user'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class ExamGrade extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_exam_grade' })
  declare idExamGrade: number

  @column()
  declare note: number

  @column()
  declare status: 'en cours' | 'à corrigé' | 'corrigé'

  @column({ columnName: 'id_user' })
  declare idUser: number

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

  @belongsTo(() => Exam, {
    foreignKey: 'idExam',
  })
  declare exam: BelongsTo<typeof Exam>

  @hasMany(() => Evaluation, {
    foreignKey: 'idExamGrade',
  })
  declare evaluations: HasMany<typeof Evaluation>
}
