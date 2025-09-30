import vine from '@vinejs/vine'

export const onlyIdClassWithExistsValidator = vine.compile(
  vine.object({
    idClass: vine.string().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
  })
)

export const getAllClassesValidator = vine.compile(
  vine.object({
    limit: vine.number().min(1).max(100).optional(),
  })
)
