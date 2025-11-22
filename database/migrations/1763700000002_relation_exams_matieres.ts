import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exams'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('id_matiere')
        .unsigned()
        .notNullable()
        .references('id_matiere')
        .inTable('matieres')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('id_matiere')
    })
  }
}
