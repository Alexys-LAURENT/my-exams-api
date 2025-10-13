import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from './user.js'
import UserResponse from './user_response.js'

export default class Evaluation extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_evaluation' })
  declare idEvaluation: number

  @column()
  declare note: number | null

  @column({ columnName: 'id_student' })
  declare idStudent: number

  @column({ columnName: 'id_teacher' })
  declare idTeacher: number

  @column({ columnName: 'id_user_response' })
  declare idUserResponse: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, {
    foreignKey: 'idStudent',
  })
  declare student: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'idTeacher',
  })
  declare teacher: BelongsTo<typeof User>

  @belongsTo(() => UserResponse, {
    foreignKey: 'idUserResponse',
  })
  declare userResponse: BelongsTo<typeof UserResponse>
}
