import vine from '@vinejs/vine'

export const onlyIdClassWithExistsValidator = vine.compile(
  vine.object({
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
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

export const DeleteClassValidator = vine.compile(
  vine.object({
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return !!row
    }),
  })
)

export const onlyIdStudentWithExistsValidator = vine.compile(
  vine.object({
    idStudent: vine.number().exists(async (db, value) => {
      const row = await db
        .from('users')
        .where('id_user', value)
        .andWhere('account_type', 'student')
        .first()
      return row ? true : false
    }),
  })
)

export const limitQueryValidator = vine.compile(
  vine.object({
    limit: vine.number().min(1).optional(),
  })
)
