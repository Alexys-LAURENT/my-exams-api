import vine from '@vinejs/vine'


export const getExamsOfClassQueryValidator = vine.compile(
  vine.object({
    status: vine.enum(['completed', 'pending', 'comming']).optional(),
    limit: vine.number().min(1).optional().transform((value) => {
      return value === undefined ? null : value
    })
  })
)


export const getExamsOfClassParamsValidator = vine.compile(
  vine.object({
    idClass: vine.string().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
  })
)