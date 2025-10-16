import vine from '@vinejs/vine'

export const idStudentAndIdExamWithExistsValidator = vine.compile(
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
