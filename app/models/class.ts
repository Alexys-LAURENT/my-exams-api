import Degree from '#models/degree'
import Exam from '#models/exam'
import User from '#models/user'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Class extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_class' })
  declare idClass: number

  @column.dateTime({ columnName: 'start_date' })
  declare startDate: DateTime

  @column.dateTime({ columnName: 'end_date' })
  declare endDate: DateTime | null

  @column({ columnName: 'id_degree' })
  declare idDegree: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @belongsTo(() => Degree, {
    foreignKey: 'idDegree',
  })
  declare degree: BelongsTo<typeof Degree>

  // Relation many-to-many avec Exam via la table pivot exams_classes
  @manyToMany(() => Exam, {
    pivotTable: 'exams_classes',
    localKey: 'idClass',
    pivotForeignKey: 'id_class',
    relatedKey: 'idExam',
    pivotRelatedForeignKey: 'id_exam',
    pivotColumns: ['start_date', 'end_date'],
  })
  declare exams: ManyToMany<typeof Exam>

  // Relations avec les étudiants via students_classes
  @manyToMany(() => User, {
    pivotTable: 'students_classes',
    localKey: 'idClass',
    pivotForeignKey: 'id_class',
    relatedKey: 'idUser',
    pivotRelatedForeignKey: 'id_student',
  })
  declare students: ManyToMany<typeof User>

  // Relations avec les enseignants via teachers_classes
  @manyToMany(() => User, {
    pivotTable: 'teachers_classes',
    localKey: 'idClass',
    pivotForeignKey: 'id_class',
    relatedKey: 'idUser',
    pivotRelatedForeignKey: 'id_teacher',
  })
  declare teachers: ManyToMany<typeof User>
}
