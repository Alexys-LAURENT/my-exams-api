import vine from '@vinejs/vine'

export const createStudentValidator = vine.compile(
  vine.object({
    lastName: vine.string().trim().maxLength(100),
    name: vine.string().trim().maxLength(100),
    email: vine.string().email().trim(),
    password: vine.string().minLength(6),
    avatarPath: vine.string().optional(),
  })
)
export const onlyIdClassWithExistsValidator = vine.compile(
  vine.object({
    idClass: vine.string().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
  })
)
