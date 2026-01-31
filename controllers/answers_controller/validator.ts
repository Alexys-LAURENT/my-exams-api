import vine from '@vinejs/vine'

export const onlyIdQuestionWithExistsValidator = vine.compile(
  vine.object({
    idQuestion: vine.number().exists(async (db, value, field) => {
      const row = await db
        .from('questions')
        .where('id_question', value)
        .where('id_exam', field.meta.idExam)
        .first()
      return row ? true : false
    }),
  })
)

export const onlyIdExamWithExistsValidator = vine.compile(
  vine.object({
    idExam: vine.number().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    }),
  })
)

export const createAnswerValidator = vine.compile(
  vine.object({
    idAnswer: vine.number().positive(),
    answer: vine.string().trim().maxLength(255),
    isCorrect: vine.boolean(),
  })
)

export const onlyIdAnswerWithExistsValidator = vine.compile(
  vine.object({
    idAnswer: vine.number().exists(async (db, value, field) => {
      const row = await db
        .from('answers')
        .where('id_answer', value)
        .where('id_question', field.meta.idQuestion)
        .where('id_exam', field.meta.idExam)
        .first()
      return row ? true : false
    }),
  })
)

export const updateAnswerValidator = vine.compile(
  vine.object({
    answer: vine.string().trim().maxLength(255).optional(),
    isCorrect: vine.boolean().optional(),
  })
)
