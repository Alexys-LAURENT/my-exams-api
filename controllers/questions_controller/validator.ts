import vine from '@vinejs/vine'

export const onlyIdExamWithExistsValidator = vine.compile(
  vine.object({
    idExam: vine.number().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
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
