import vine from '@vinejs/vine'

export const onlyIdMatiereWithExistsValidator = vine.compile(
  vine.object({
    idMatiere: vine.number().exists(async (db, value) => {
      const row = await db.from('matieres').where('id_matiere', value).first()
      return row ? true : false
    }),
  })
)

export const createMatiereValidator = vine.compile(
  vine.object({
    nom: vine.string().trim().minLength(2).maxLength(100),
  })
)

export const updateMatiereValidator = vine.compile(
  vine.object({
    nom: vine.string().trim().minLength(2).maxLength(100).optional(),
  })
)

export const teacherMatiereAssociationValidator = vine.compile(
  vine.object({
    idTeacher: vine.number().exists(async (db, value) => {
      const row = await db
        .from('users')
        .where('id_user', value)
        .where('account_type', 'teacher')
        .first()
      return row ? true : false
    }),
    idMatiere: vine.number().exists(async (db, value) => {
      const row = await db.from('matieres').where('id_matiere', value).first()
      return row ? true : false
    }),
  })
)
