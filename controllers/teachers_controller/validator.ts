import vine from '@vinejs/vine'

export const createTeacherValidator = vine.compile(
  vine.object({
    lastName: vine.string().trim().maxLength(100),
    name: vine.string().trim().maxLength(100),
    email: vine.string().email().trim(),
    password: vine.string().minLength(6),
    avatarPath: vine.string().optional(),
  })
)
