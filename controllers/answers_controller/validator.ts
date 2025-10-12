import vine from '@vinejs/vine'

export const onlyIdQuestionWithExistsValidator = vine.compile(
  vine.object({
    idQuestion: vine.number().exists(async (db, value) => {
      const row = await db.from('questions').where('id_question', value).first()
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
