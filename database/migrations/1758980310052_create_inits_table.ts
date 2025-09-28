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
      table.datetime('end_date').notNullable()
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
      table.integer('time').notNullable()
      table.string('image_path').nullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table pivot to link exams to classes (many-to-many)
    this.schema.createTable('exams_classes', (table) => {
      table.integer('id_exam').unsigned().notNullable()
      table.integer('id_class').unsigned().notNullable()
      table.foreign('id_exam').references('id_exam').inTable('exams').onDelete('CASCADE')
      table.foreign('id_class').references('id_class').inTable('classes').onDelete('CASCADE')
      table.primary(['id_exam', 'id_class'])
    })

    // Table exam_grades
    this.schema.createTable('exam_grades', (table) => {
      table.increments('id_exam_grade').primary()
      table.decimal('note', 5, 2).nullable()
      table.enum('status', ['en cours', 'à corrigé', 'corrigé']).notNullable().defaultTo('en_cours')
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
      table.primary(['id_question', 'id_exam'])
      table.string('title').notNullable()
      table.text('commentary').nullable()
      table.boolean('is_multiple').notNullable()
      table.boolean('is_qcm').notNullable()
      table.decimal('max_points', 8, 2).notNullable()
      table.foreign('id_exam').references('id_exam').inTable('exams').onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table answers
    this.schema.createTable('answers', (table) => {
      table.increments('id_answer').unsigned().notNullable()
      table.integer('id_question').unsigned().notNullable()
      table.integer('id_exam').unsigned().notNullable()
      table.text('answer').notNullable()
      table.boolean('is_correct').notNullable()
      table.primary(['id_answer', 'id_question', 'id_exam'])
      table
        .foreign(['id_question', 'id_exam'])
        .references(['id_question', 'id_exam'])
        .inTable('questions')
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
      table.foreign('id_user').references('id_user').inTable('users').onDelete('CASCADE')
      table
        .foreign(['id_question', 'id_exam'])
        .references(['id_question', 'id_exam'])
        .inTable('questions')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table pivot to link user_responses to answers (many-to-many for QCM with multiple answers)
    this.schema.createTable('user_responses_answers', (table) => {
      table.integer('id_user_response').unsigned().notNullable()
      table.integer('id_answer').unsigned().notNullable()
      table.integer('id_question').unsigned().notNullable()
      table.integer('id_exam').unsigned().notNullable()
      table
        .foreign('id_user_response')
        .references('id_user_response')
        .inTable('user_responses')
        .onDelete('CASCADE')
      table
        .foreign(['id_answer', 'id_question', 'id_exam'])
        .references(['id_answer', 'id_question', 'id_exam'])
        .inTable('answers')
        .onDelete('CASCADE')
      table.primary(['id_user_response', 'id_answer', 'id_question'])
    })

    // Table evaluations
    this.schema.createTable('evaluations', (table) => {
      table.increments('id_evaluation').primary()
      table.decimal('note', 8, 2).nullable()
      table.integer('id_user_response').unsigned().notNullable()
      table.integer('id_student').unsigned().notNullable()
      table.integer('id_teacher').unsigned().notNullable()
      table
        .foreign('id_user_response')
        .references('id_user_response')
        .inTable('user_responses')
        .onDelete('CASCADE')
      table.foreign('id_student').references('id_user').inTable('users').onDelete('CASCADE')
      table.foreign('id_teacher').references('id_user').inTable('users').onDelete('CASCADE')
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table de liaison students_classes (relation many-to-many)
    this.schema.createTable('students_classes', (table) => {
      table.integer('id_student').unsigned().notNullable()
      table.integer('id_class').unsigned().notNullable()
      table.foreign('id_student').references('id_user').inTable('users').onDelete('CASCADE')
      table.foreign('id_class').references('id_class').inTable('classes').onDelete('CASCADE')
      table.primary(['id_student', 'id_class'])
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })

    // Table de liaison teachers_classes (relation many-to-many)
    this.schema.createTable('teachers_classes', (table) => {
      table.integer('id_teacher').unsigned().notNullable()
      table.integer('id_class').unsigned().notNullable()
      table.foreign('id_teacher').references('id_user').inTable('users').onDelete('CASCADE')
      table.foreign('id_class').references('id_class').inTable('classes').onDelete('CASCADE')
      table.primary(['id_teacher', 'id_class'])
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable('teachers_classes')
    this.schema.dropTable('students_classes')
    this.schema.dropTable('evaluations')
    this.schema.dropTable('user_responses_answers')
    this.schema.dropTable('user_responses')
    this.schema.dropTable('answers')
    this.schema.dropTable('questions')
    this.schema.dropTable('exam_grades')
    this.schema.dropTable('exams_classes')
    this.schema.dropTable('exams')
    this.schema.dropTable('classes')
    this.schema.dropTable('degrees')
  }
}
