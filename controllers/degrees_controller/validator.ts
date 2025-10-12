import vine from '@vinejs/vine'

export const onlyIdClassWithExistsValidator = vine.compile(
  vine.object({
    idClass: vine.string().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
  })
)

/**
 * Validateur pour vérifier l'existence d'un ID de diplôme
 */
export const idDegreeExistsValidator = vine.compile(
  vine.object({
    idDegree: vine.string().exists(async (db, value) => {
      const row = await db.from('degrees').where('id_degree', value).first()
      return row ? true : false
    }),
  })
)

/**
 * Validateur pour la route GET /api/degrees
 * Ce validateur est vide car la route ne nécessite pas de paramètres
 */
export const getAllDegreesValidator = vine.compile(
  vine.object({})
)

