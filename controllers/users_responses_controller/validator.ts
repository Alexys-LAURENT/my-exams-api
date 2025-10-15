import vine from '@vinejs/vine'

export const createUsersResponseValidator = vine.compile(
  vine.object({
    idExam: vine.number().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    }),
    idQuestion: vine.number().exists(async (db, value) => {
      const row = await db.from('questions').where('id_question', value).first()
      return row ? true : false
    }),
  })
)

export const checkCustomOrNotValidator = vine.compile(
  vine.object({
    custom: vine.string().optional(),
    answers: vine.union([
      vine.union.if(
        (value) => vine.helpers.isArray<File>(value),
        vine.array(
          vine
            .string()
            .exists(async (db, value, field) => {
              const row = await db
                .from('answers')
                .where('id_answer', value)
                .where('id_question', field.meta.idQuestion)
                .where('id_exam', field.meta.idExam)
                .first()
              return row ? true : false
            })
            .optional()
        )
      ),
      vine.union.else(
        vine
          .string()
          .exists(async (db, value, field) => {
            const row = await db
              .from('answers')
              .where('id_answer', value)
              .where('id_question', field.meta.idQuestion)
              .where('id_exam', field.meta.idExam)
              .first()
            return row ? true : false
          })
          .optional()
          .transform((value) => (value ? [value] : []))
      ),
    ]),
  })
)
