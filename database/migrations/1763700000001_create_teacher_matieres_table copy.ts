import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateTeacherMatieresTable extends BaseSchema {
  protected tableName = 'teacher_matieres'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_teacher_matiere')
      table
        .integer('id_teacher')
        .unsigned()
        .references('id_user')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('id_matiere')
        .unsigned()
        .references('id_matiere')
        .inTable('matieres')
        .onDelete('CASCADE')
      table.unique(['id_teacher', 'id_matiere'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
