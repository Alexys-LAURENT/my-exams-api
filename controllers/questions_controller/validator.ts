import vine from '@vinejs/vine'

export const onlyIdExamWithExistsValidator = vine.compile(
  vine.object({
    idExam: vine.number().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    }),
  })
)

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

export const createQuestionValidator = vine.compile(
  vine.object({
    idQuestion: vine.number().positive(),
    title: vine.string().trim().maxLength(255),
    commentary: vine.string().trim().maxLength(255).optional(),
    isMultiple: vine.boolean(),
    isQcm: vine.boolean(),
    maxPoints: vine.number().min(0),
  })
)

export const updateQuestionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().maxLength(255).optional(),
    commentary: vine.string().trim().maxLength(255).nullable().optional(),
    isMultiple: vine.boolean().optional(),
    isQcm: vine.boolean().optional(),
    maxPoints: vine.number().min(0).optional(),
  })
)
