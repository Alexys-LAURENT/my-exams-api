import vine from '@vinejs/vine'

export const createEvaluationValidator = vine.compile(
  vine.object({
    idUserResponse: vine.number().exists(async (db, value) => {
      const row = await db.from('user_responses').where('id_user_response', value).first()
      return row ? true : false
    }),
    note: vine.number().min(0).max(20),
    commentary: vine.string().optional().nullable(),
  })
)

export const updateEvaluationValidator = vine.compile(
  vine.object({
    note: vine.number().min(0).max(20),
    commentary: vine.string().optional().nullable(),
  })
)

export const onlyIdEvaluationWithExistsValidator = vine.compile(
  vine.object({
    idEvaluation: vine.number().exists(async (db, value) => {
      const row = await db.from('evaluations').where('id_evaluation', value).first()
      return row ? true : false
    }),
  })
)
