import Class from '#models/class'
import ExamGrade from '#models/exam_grade'
import UserResponse from '#models/user_response'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true, columnName: 'id_user' })
  declare idUser: number

  @column({ columnName: 'last_name' })
  declare lastName: string | null

  @column()
  declare name: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column({ columnName: 'avatar_path' })
  declare avatarPath: string | null

  @column({ columnName: 'account_type' })
  declare accountType: 'student' | 'teacher' | 'admin'

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @hasMany(() => ExamGrade, {
    foreignKey: 'idUser',
  })
  declare examGrades: HasMany<typeof ExamGrade>

  @hasMany(() => UserResponse, {
    foreignKey: 'idUser',
  })
  declare userResponses: HasMany<typeof UserResponse>

  @manyToMany(() => Class, {
    pivotTable: 'user_classes',
    localKey: 'idUser',
    pivotForeignKey: 'id_user',
    relatedKey: 'idClass',
    pivotRelatedForeignKey: 'id_class',
    pivotColumns: ['relation_type'],
  })
  declare classes: ManyToMany<typeof Class>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
