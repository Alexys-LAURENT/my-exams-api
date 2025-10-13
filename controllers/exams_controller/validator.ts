import vine from '@vinejs/vine'

export const classAndExamParamsValidator = vine.compile(
  vine.object({
    idClass: vine.string().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
    idExam: vine.string().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    })
  })
)

export const classExamParamsValidator = vine.compile(
  vine.object({
    idClass: vine.string().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
    idExam: vine.string().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    })
  })
)

export const examDateValidator = vine.compile(
  vine.object({
    start_date: vine.date({ formats: ['yyyy-MM-ddTHH:mm:ssZ'] }),
    end_date: vine.date({ formats: ['yyyy-MM-ddTHH:mm:ssZ'] })
  })
)

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

export const onlyIdExamWithExistsValidator = vine.compile(
  vine.object({
    idExam: vine.string().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    }),
  })
)

export const startExamValidator = vine.compile(
  vine.object({
    idExam: vine.string().exists(async (db, value) => {
      const row = await db.from('exams').where('id_exam', value).first()
      return row ? true : false
    }),
  })
)


export const getExamsOfClassQueryValidator = vine.compile(
  vine.object({
    status: vine.enum(['completed', 'pending', 'comming']).optional(),
    limit: vine.number().min(1).optional().transform((value) => {
      return value === undefined ? null : value
    })
  })
)


export const getExamsOfClassParamsValidator = vine.compile(
  vine.object({
    idClass: vine.string().exists(async (db, value) => {
      const row = await db.from('classes').where('id_class', value).first()
      return row ? true : false
    }),
  })
)
