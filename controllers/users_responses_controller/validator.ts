import vine from '@vinejs/vine'

export const onlyIdExamWithExistsValidator = vine.compile(
  vine.object({
    idExam: vine.number().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    }),
  })
)

export const onlyIdQuestionWithExistsValidator = vine.compile(
  vine.object({
    idQuestion: vine.number().exists(async (db, value) => {
      const row = await db.from('questions').where('id_question', value).first()
      return row ? true : false
    }),
  })
)

export const onlyIdStudentWithExistsValidator = vine.compile(
  vine.object({
    idUser: vine.number().exists(async (db, value) => {
      const row = await db
        .from('users')
        .where('id_user', value)
        .andWhere('account_type', 'student')
        .first()
      return row ? true : false
    }),
  })
)

export const createUsersResponseValidator = vine.compile(
  vine.object({
    custom: vine.string().optional(),
    idUser: vine.number().positive(),
    idQuestion: vine.number().positive(),
    idExam: vine.number().positive(),
  })
)
