import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddDatesToExamsClasses extends BaseSchema {
  protected tableName = 'exams_classes'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('start_date').nullable()
      table.timestamp('end_date').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('start_date')
      table.dropColumn('end_date')
    })
  }
}
