import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddCommentaryToEvaluations extends BaseSchema {
  protected tableName = 'classes'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('name').notNullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('name')
    })
  }
}
