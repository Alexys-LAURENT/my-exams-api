import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Table promotions
    this.schema.createTable('promotions', (table) => {
      table.increments('id_promotion').primary()
      table.string('name').notNullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table classes
    this.schema.createTable('classes', (table) => {
      table.increments('id_class').primary()
      table.datetime('creation_date').notNullable()
      table.integer('id_promotion').unsigned().notNullable()
      table
        .foreign('id_promotion')
        .references('id_promotion')
        .inTable('promotions')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table exams
    this.schema.createTable('exams', (table) => {
      table.increments('id_exam').primary()
      table.string('title').notNullable()
      table.text('description').nullable()
      table.datetime('time').notNullable()
      table.string('image_path').nullable()
      table.integer('id_class').unsigned().notNullable()
      table.foreign('id_class').references('id_class').inTable('classes').onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table questions
    this.schema.createTable('questions', (table) => {
      table.increments('id_question').primary()
      table.string('title').notNullable()
      table.text('commentary').nullable()
      table.boolean('is_multiple').notNullable().defaultTo(false)
      table.boolean('is_qcm').notNullable().defaultTo(true)
      table.decimal('max_points', 8, 2).notNullable().defaultTo(0)
      table.integer('id_exam').unsigned().notNullable()
      table.foreign('id_exam').references('id_exam').inTable('exams').onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table answers
    this.schema.createTable('answers', (table) => {
      table.increments('id_answer').primary()
      table.text('answer').notNullable()
      table.boolean('is_correct').notNullable().defaultTo(false)
      table.integer('id_question').unsigned().notNullable()
      table
        .foreign('id_question')
        .references('id_question')
        .inTable('questions')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table evaluations
    this.schema.createTable('evaluations', (table) => {
      table.increments('id_evaluation').primary()
      table.decimal('note', 8, 2).nullable()
      table.integer('id_exam').unsigned().notNullable()
      table.integer('id_user').unsigned().notNullable()
      table.foreign('id_exam').references('id_exam').inTable('exams').onDelete('CASCADE')
      table.foreign('id_user').references('id_user').inTable('users').onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table responses
    this.schema.createTable('responses', (table) => {
      table.increments('id_response').primary()
      table.text('custom').nullable()
      table.integer('id_evaluation').unsigned().notNullable()
      table.integer('id_question').unsigned().notNullable()
      table.integer('id_answer').unsigned().nullable()
      table
        .foreign('id_evaluation')
        .references('id_evaluation')
        .inTable('evaluations')
        .onDelete('CASCADE')
      table
        .foreign('id_question')
        .references('id_question')
        .inTable('questions')
        .onDelete('CASCADE')
      table.foreign('id_answer').references('id_answer').inTable('answers').onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table de liaison users_classes (relation many-to-many pour appartenir/gérer/créer)
    this.schema.createTable('user_classes', (table) => {
      table.increments('id').primary()
      table.integer('id_user').unsigned().notNullable()
      table.integer('id_class').unsigned().notNullable()
      table.enum('relation_type', ['belongs', 'manages', 'creates']).notNullable()
      table.foreign('id_user').references('id_user').inTable('users').onDelete('CASCADE')
      table.foreign('id_class').references('id_class').inTable('classes').onDelete('CASCADE')
      table.unique(['id_user', 'id_class', 'relation_type'])
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable('user_classes')
    this.schema.dropTable('responses')
    this.schema.dropTable('evaluations')
    this.schema.dropTable('answers')
    this.schema.dropTable('questions')
    this.schema.dropTable('exams')
    this.schema.dropTable('classes')
    this.schema.dropTable('promotions')
  }
}
