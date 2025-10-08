import vine from '@vinejs/vine'

export const onlyIdClassWithExistsValidator = vine.compile(
  vine.object({
    idClass: vine.string().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
  })
)

export const classStudentParamsValidator = vine.compile(
  vine.object({
    idClass: vine.string().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
    idStudent: vine.string().exists(async (db, value) => {
      const row = await db.from('users')
        .where('id_user', value)
        .where('account_type', 'student')
        .first()
      return row ? true : false
    })
  })
)
