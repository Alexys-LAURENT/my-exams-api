import Class from '#models/class'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Promotion extends BaseModel {
  @column({ isPrimary: true, columnName: 'id_promotion' })
  declare idPromotion: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @hasMany(() => Class, {
    foreignKey: 'id_promotion',
  })
  declare classes: HasMany<typeof Class>
}
