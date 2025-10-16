import vine from '@vinejs/vine'

export const onlyIdClassWithExistsValidator = vine.compile(
  vine.object({
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
  })
)

export const createDegreeValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(100).trim(),
  })
)

export const idDegreeExistsValidator = vine.compile(
  vine.object({
    idDegree: vine.number().exists(async (db, value) => {
      const row = await db.from('degrees').where('id_degree', value).first()
      return row ? true : false
    }),
  })
)

export const degreeValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(100).trim(),
  })
)
