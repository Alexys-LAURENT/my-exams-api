import vine from '@vinejs/vine'


export const onlyIdClassWithExistsValidator = vine.compile(
  vine.object({
    idClass: vine.string().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
  })  
)

export const onlyIdAdminAndClassWithExistsValidator = vine.compile(
  vine.object({
    idAdmin: vine.string().exists(async (db, value) => {
      const row = await db.from('users').where('id_user', value).andWhere('account_type', 'admin').first()
      return !!row
    }),
    idClass: vine.string().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return !!row
    }),
  })
)
