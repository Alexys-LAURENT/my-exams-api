import vine from '@vinejs/vine'

export const classAndExamParamsValidator = vine.compile(
  vine.object({
    idClass: vine.string().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
    idExam: vine.string().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    })
  })
)

export const examDateValidator = vine.compile(
  vine.object({
    start_date: vine.date({ formats: ['yyyy-MM-ddTHH:mm:ssZ'] }),
    end_date: vine.date({ formats: ['yyyy-MM-ddTHH:mm:ssZ'] })
  })
)
