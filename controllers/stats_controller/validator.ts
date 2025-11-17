import vine from '@vinejs/vine'

export const idClassAndIdUserValidator = vine.compile(
  vine.object({
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return !!row
    }),
    idUser: vine.number().exists(async (db, value) => {
      const row = await db
        .from('users')
        .where('id_user', value)
        .andWhere('account_type', 'student')
        .first()
      return !!row
    }),
  })
)

export const idTeacherAndIdClassValidator = vine.compile(
  vine.object({
    idTeacher: vine.number().exists(async (db, value) => {
      const row = await db
        .from('users')
        .where('id_user', value)
        .andWhere('account_type', 'teacher')
        .first()
      return !!row
    }),
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return !!row
    }),
  })
)

export const idExamAndIdClassValidator = vine.compile(
  vine.object({
    idExam: vine.number().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return !!row
    }),
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return !!row
    }),
  })
)

export const idExamValidator = vine.compile(
  vine.object({
    idExam: vine.number().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return !!row
    }),
  })
)

export const idClassValidator = vine.compile(
  vine.object({
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return !!row
    }),
  })
)
