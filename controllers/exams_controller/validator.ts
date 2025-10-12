import vine from '@vinejs/vine'

export const createExamValidator = vine.compile(
  vine.object({
    title: vine.string().trim().maxLength(100),
    desc: vine.string().trim().maxLength(255),
    time: vine.number().min(0),
    imagePath: vine.string().optional(),
    idTeacher: vine
      .number()
      .positive()
      .exists(async (db, value) => {
        const row = await db
          .from('users')
          .where('id_user', value)
          .andWhere('account_type', 'teacher')
          .first()
        return !!row
      }),
  })
)
