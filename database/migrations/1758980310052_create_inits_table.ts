import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Table degrees
    this.schema.createTable('degrees', (table) => {
      table.increments('id_degree').primary()
      table.string('name').notNullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table classes
    this.schema.createTable('classes', (table) => {
      table.increments('id_class').primary()
      table.datetime('start_date').notNullable()
      table.datetime('end_date').nullable()
      table.integer('id_degree').unsigned().notNullable()
      table.foreign('id_degree').references('id_degree').inTable('degrees').onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table exams
    this.schema.createTable('exams', (table) => {
      table.increments('id_exam').primary()
      table.string('title').notNullable()
      table.text('desc').nullable()
      table.datetime('time').notNullable()
      table.string('image_path').nullable()
      table.integer('id_class').unsigned().notNullable()
      table.foreign('id_class').references('id_class').inTable('classes').onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table exam_grades
    this.schema.createTable('exam_grades', (table) => {
      table.increments('id_exam_grade').primary()
      table.decimal('note', 5, 2).notNullable()
      table.enum('status', ['en_cours', 'termine', 'corrige']).notNullable().defaultTo('en_cours')
      table.integer('id_user').unsigned().notNullable()
      table.integer('id_exam').unsigned().notNullable()
      table.foreign('id_user').references('id_user').inTable('users').onDelete('CASCADE')
      table.foreign('id_exam').references('id_exam').inTable('exams').onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table questions
    this.schema.createTable('questions', (table) => {
      table.increments('id_question').notNullable()
      table.integer('id_exam').unsigned().notNullable()
      table.string('title').notNullable()
      table.text('commentary').nullable()
      table.boolean('is_multiple').notNullable().defaultTo(false)
      table.boolean('is_qcm').notNullable().defaultTo(true)
      table.decimal('max_points', 8, 2).notNullable().defaultTo(0)
      table.primary(['id_question', 'id_exam'])
      table.foreign('id_exam').references('id_exam').inTable('exams').onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table answers
    this.schema.createTable('answers', (table) => {
      table.increments('id_answer').notNullable()
      table.integer('id_question').unsigned().notNullable()
      table.integer('id_exam').unsigned().notNullable()
      table.text('answer').notNullable()
      table.boolean('is_correct').notNullable().defaultTo(false)
      table.primary(['id_answer', 'id_question'])
      table
        .foreign(['id_question', 'id_exam'])
        .references(['id_question', 'id_exam'])
        .inTable('questions')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table evaluations
    this.schema.createTable('evaluations', (table) => {
      table.increments('id_evaluation').primary()
      table.decimal('note', 8, 2).nullable()
      table.integer('id_exam_grade').unsigned().notNullable()
      table
        .foreign('id_exam_grade')
        .references('id_exam_grade')
        .inTable('exam_grades')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table user_responses
    this.schema.createTable('user_responses', (table) => {
      table.increments('id_user_response').primary()
      table.text('custom').nullable()
      table.integer('id_user').unsigned().notNullable()
      table.integer('id_question').unsigned().notNullable()
      table.integer('id_exam').unsigned().notNullable()
      table.integer('id_answer').unsigned().nullable()
      table.foreign('id_user').references('id_user').inTable('users').onDelete('CASCADE')
      table
        .foreign(['id_question', 'id_exam'])
        .references(['id_question', 'id_exam'])
        .inTable('questions')
        .onDelete('CASCADE')
      table
        .foreign(['id_answer', 'id_question'])
        .references(['id_answer', 'id_question'])
        .inTable('answers')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table de liaison users_classes (relation many-to-many pour étudiants/enseignants)
    this.schema.createTable('user_classes', (table) => {
      table.increments('id').primary()
      table.integer('id_user').unsigned().notNullable()
      table.integer('id_class').unsigned().notNullable()
      table.enum('relation_type', ['student', 'teacher']).notNullable()
      table.foreign('id_user').references('id_user').inTable('users').onDelete('CASCADE')
      table.foreign('id_class').references('id_class').inTable('classes').onDelete('CASCADE')
      table.unique(['id_user', 'id_class', 'relation_type'])
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable('user_classes')
    this.schema.dropTable('user_responses')
    this.schema.dropTable('evaluations')
    this.schema.dropTable('exam_grades')
    this.schema.dropTable('answers')
    this.schema.dropTable('questions')
    this.schema.dropTable('exams')
    this.schema.dropTable('classes')
    this.schema.dropTable('degrees')
  }
}
