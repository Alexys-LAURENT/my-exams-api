import vine from '@vinejs/vine'

export const idClassAndIdExamWithExistsValidator = vine.compile(
  vine.object({
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
    idExam: vine.number().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    }),
  })
)

export const examDateValidator = vine.compile(
  vine.object({
    start_date: vine.date({ formats: ['iso8601'] }),
    end_date: vine.date({ formats: ['iso8601'] }),
  })
)

export const createExamValidator = vine.compile(
  vine.object({
    title: vine.string().trim().maxLength(100),
    desc: vine.string().trim().maxLength(255).nullable(),
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
    idMatiere: vine
      .number()
      .positive()
      .exists(async (db, value) => {
        const row = await db.from('matieres').where('id_matiere', value).first()
        return !!row
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

export const idStudentAndIdExamAndIdClassWithExistsValidator = vine.compile(
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
    idClass: vine
      .number()
      .positive()
      .exists(async (db, value) => {
        const row = await db.from('classes').where('id_class', value).first()
        return !!row
      }),
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

export const onlyIdExamAndIdClassAndIdStudentWithExistsValidator = vine.compile(
  vine.object({
    idExam: vine.number().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    }),
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
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

export const getExamsOfClassQueryValidator = vine.compile(
  vine.object({
    status: vine.enum(['completed', 'pending', 'comming']).optional(),
    limit: vine
      .number()
      .min(1)
      .optional()
      .transform((value) => {
        return value === undefined ? null : value
      }),
  })
)

export const onlyIdClassWithExistsValidator = vine.compile(
  vine.object({
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
  })
)

export const updateExamValidator = vine.compile(
  vine.object({
    title: vine.string().trim().maxLength(100).optional(),
    desc: vine.string().trim().maxLength(255).nullable().optional(),
    time: vine.number().min(0).optional(),
    imagePath: vine.string().optional(),
    idMatiere: vine
      .number()
      .positive()
      .exists(async (db, value) => {
        const row = await db.from('matieres').where('id_matiere', value).first()
        return !!row
      })
      .optional(),
  })
)

export const getStudentExamsValidator = vine.compile(
  vine.object({
    idClass: vine.number().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
    idStudent: vine.number().exists(async (db, value) => {
      const row = await db
        .from('users')
        .where('id_user', value)
        .andWhere('account_type', 'student')
        .first()
      return row ? true : false
    }),
    status: vine.enum(['completed', 'pending', 'comming']),
  })
)

export const onlyLimitValidator = vine.compile(
  vine.object({
    limit: vine.number().min(1).optional(),
  })
)
