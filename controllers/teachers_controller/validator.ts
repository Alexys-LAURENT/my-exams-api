import vine from '@vinejs/vine'

export const classTeacherAssociationValidator = vine.compile(
  vine.object({
    idClass: vine.string().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
    idTeacher: vine.string().exists(async (db, value) => {
      const row = await db.from('users')
        .where('id_user', value)
        .where('account_type', 'teacher')
        .first()
      return row ? true : false
    })
  })
)