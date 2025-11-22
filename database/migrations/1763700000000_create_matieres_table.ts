import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateMatieresTable extends BaseSchema {
  protected tableName = 'matieres'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_matiere')
      table.string('nom').notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
