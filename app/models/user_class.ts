import Class from '#models/class'
import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class UserClass extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare idUser: number

  @column()
  declare idClass: number

  @column()
  declare relationType: 'belongs' | 'manages' | 'creates'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, {
    foreignKey: 'idUser',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Class, {
    foreignKey: 'idClass',
  })
  declare class: BelongsTo<typeof Class>
}
