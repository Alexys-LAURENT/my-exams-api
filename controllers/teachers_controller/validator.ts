import vine from '@vinejs/vine'

export const onlyIdTeacherWithExistsValidator = vine.compile(
  vine.object({
    idTeacher: vine.string().exists(async (db, value) => {
      const row = await db
        .from('users')
        .where('id_user', value)
        .andWhere('account_type', 'teacher')
        .first()
      return row ? true : false
    }),
  })
)

export const updateTeacherValidator = vine.compile(
  vine.object({
    lastName: vine.string().trim().maxLength(100).optional(),
    name: vine.string().trim().maxLength(100).optional(),
    email: vine.string().email().trim().optional(),
    avatarPath: vine.string().optional(),
  })
)
