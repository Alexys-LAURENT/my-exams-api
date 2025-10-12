import vine from '@vinejs/vine'

export const onlyIdExamWithExistsValidator = vine.compile(
  vine.object({
    idExam: vine.string().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    }),
  })
)
