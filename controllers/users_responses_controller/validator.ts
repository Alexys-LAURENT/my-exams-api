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
        (value) => vine.helpers.isArray<number>(value),
        vine.array(
          vine
            .number()
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
          .number()
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
          .transform((value) => (value ? [value] : ([] as number[])))
      ),
    ]),
  })
)

export const updateUsersResponseValidator = vine.compile(
  vine.object({
    idUserResponse: vine.number().exists(async (db, value) => {
      const row = await db.from('user_responses').where('id_user_response', value).first()
      return row ? true : false
    }),
  })
)
