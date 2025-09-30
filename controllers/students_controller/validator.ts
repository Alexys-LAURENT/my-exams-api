import vine from '@vinejs/vine'

export const onlyIdStudentWithExistsValidator = vine.compile(
	vine.object({
		idStudent: vine.string().exists(async (db, value) => {
			const row = await db.from('users').where('id_user', value).first()
			return row ? true : false
		}),
	})
)
