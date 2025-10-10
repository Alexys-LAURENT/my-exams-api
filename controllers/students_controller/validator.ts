
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
export const updateStudentValidator = vine.compile(
  vine.object({
    lastName: vine.string().trim().maxLength(100).optional(),
    name: vine.string().trim().maxLength(100).optional(),
    email: vine.string().email().trim().optional(),
    password: vine.string().minLength(6).optional(),
    avatarPath: vine.string().optional(),
  })
)
export const onlyIdStudentWithExistsValidator = vine.compile(
  vine.object({
    idStudent: vine.string().exists(async (db, value) => {
      const row = await db
        .from('users')
        .where('id_user', value)
        .andWhere('account_type', 'student')
        .first()
      return row ? true : false
    }),
  })
)