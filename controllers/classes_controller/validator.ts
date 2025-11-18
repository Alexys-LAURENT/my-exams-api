import vine from '@vinejs/vine'

export const onlyIdClassWithExistsValidator = vine.compile(
  vine.object({
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
  })
)

export const onlyIdTeacherWithExistsValidator = vine.compile(
  vine.object({
    idTeacher: vine.number().exists(async (db, value) => {
      const row = await db
        .from('users')
        .where('id_user', value)
        .andWhere('account_type', 'teacher')
        .first()
      return row ? true : false
    }),
  })
)

export const DeleteClassValidator = vine.compile(
  vine.object({
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return !!row
    }),
  })
)

export const onlyIdStudentWithExistsValidator = vine.compile(
  vine.object({
    idStudent: vine.number().exists(async (db, value) => {
      const row = await db
        .from('users')
        .where('id_user', value)
        .andWhere('account_type', 'student')
        .first()
      return row ? true : false
    }),
  })
)

export const limitQueryValidator = vine.compile(
  vine.object({
    limit: vine.number().min(1).optional(),
  })
)

export const onlyIdExamWithExistsValidator = vine.compile(
  vine.object({
    idExam: vine.number().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    }),
  })
)

export const createClassValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    startDate: vine.date(),
    endDate: vine.date(),
    idDegree: vine.number().exists(async (db, value) => {
      const row = await db.from('degrees').where('id_degree', value).first()
      return !!row
    }),
  })
)

export const updateClassValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    startDate: vine.date({ formats: ['iso8601'] }).optional(),
    endDate: vine.date({ formats: ['iso8601'] }).optional(),
    idDegree: vine.number().exists(async (db, value) => {
      const row = await db.from('degrees').where('id_degree', value).first()
      return !!row
    }),
  })
)
