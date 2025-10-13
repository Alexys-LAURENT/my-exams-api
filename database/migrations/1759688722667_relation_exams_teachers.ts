import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exams'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('id_teacher')
        .unsigned()
        .notNullable()
        .references('id_user')
        .inTable('users')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('id_teacher')
    })
  }
}
