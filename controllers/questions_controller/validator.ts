import vine from '@vinejs/vine'

export const examQuestionParamsValidator = vine.compile(
  vine.object({
    idExam: vine.number().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return !!row
    }),
    idQuestion: vine.number().exists(async (db, value) => {
      const row = await db.from('questions').where('id_question', value).first()
      return !!row
    }),
  })
)

export const onlyIdExamWithExistsValidator = vine.compile(
  vine.object({
    idExam: vine.string().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    }),
  })
)
