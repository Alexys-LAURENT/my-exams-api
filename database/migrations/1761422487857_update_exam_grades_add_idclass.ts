import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddIdClassToExamGrades extends BaseSchema {
  protected tableName = 'exam_grades'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('id_class').unsigned().notNullable()
      table.foreign('id_class').references('id_class').inTable('classes').onDelete('SET NULL')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('id_class')
    })
  }
}
