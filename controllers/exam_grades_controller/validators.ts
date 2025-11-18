import vine from '@vinejs/vine'

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

export const updateExamGradeValidator = vine.compile(
  vine.object({
    note: vine.number().min(0).max(20),
    status: vine.enum(['en cours', 'à corrigé', 'corrigé']),
  })
)

export const onlyIdExamGradeWithExistsValidator = vine.compile(
  vine.object({
    idExamGrade: vine.number().exists(async (db, value) => {
      const row = await db.from('exam_grades').where('id_exam_grade', value).first()
      return row ? true : false
    }),
  })
)

export const getExamGradesForStudentValidator = vine.compile(
  vine.object({
    limit: vine.number().min(1).optional(),
    status: vine.enum(['in_progress', 'to_correct', 'corrected']).optional(),
  })
)

export const idStudentAndIdClassWithExistsValidator = vine.compile(
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
    idClass: vine
      .number()
      .positive()
      .exists(async (db, value) => {
        const row = await db.from('classes').where('id_class', value).first()
        return !!row
      }),
  })
)
