import vine from '@vinejs/vine'

export const onlyIdTeacherWithExistsValidator = vine.compile(
  vine.object({
    idTeacher: vine.string().exists(async (db, value) => {
      const row = await db
        .from('users')
        .where('id_user', value)
        .andWhere('account_type', 'teacher')
        .first()
      return row ? true : false
    }),
  })
)

export const checkStatusValidator = vine.compile(
  vine.object({
    idStudent: vine
      .number()
      .positive()
      .exists(async (db, value) => {
        const row = await db
          .from('users')
          .where('id_user', value)
          .andWhere('account_type', 'student')
          .first()
        return !!row
      }),

    idExam: vine
      .number()
      .positive()
      .exists(async (db, value) => {
        const row = await db.from('exams').where('id_exam', value).first()
        return !!row
      }),
  })
)
