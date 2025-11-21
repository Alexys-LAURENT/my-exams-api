import vine from '@vinejs/vine'

export const classTeacherAssociationValidator = vine.compile(
  vine.object({
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
    idTeacher: vine.number().exists(async (db, value) => {
      const row = await db
        .from('users')
        .where('id_user', value)
        .where('account_type', 'teacher')
        .first()
      return row ? true : false
    }),
  })
)

export const classTeacherParamsValidator = vine.compile(
  vine.object({
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
    idTeacher: vine.number().exists(async (db, value) => {
      const row = await db
        .from('users')
        .where('id_user', value)
        .where('account_type', 'teacher')
        .first()
      return row ? true : false
    }),
  })
)

export const createTeacherValidator = vine.compile(
  vine.object({
    lastName: vine.string().trim().maxLength(100),
    name: vine.string().trim().maxLength(100),
    email: vine.string().email().trim(),
    password: vine.string().minLength(6),
    avatarPath: vine.string().optional(),
    matiereIds: vine.array(vine.number()).minLength(1),
  })
)

export const onlyIdTeacherWithExistsValidator = vine.compile(
  vine.object({
    idTeacher: vine.number().exists(async (db, value) => {
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
