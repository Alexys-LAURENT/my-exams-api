import vine from '@vinejs/vine'

export const createExamValidator = vine.compile(
  vine.object({
    title: vine.string().trim().maxLength(100),
    desc: vine.string().trim().maxLength(255),
    time: vine.number().min(0),
    imagePath: vine.string().optional(),
    idTeacher: vine.number().min(0),
  })
)
