import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddCommentaryToEvaluations extends BaseSchema {
  protected tableName = 'evaluations'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('commentary').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('commentary')
    })
  }
}
