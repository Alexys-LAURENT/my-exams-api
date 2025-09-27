import vine from '@vinejs/vine'

// Do not check in database if the token is valid because if no the controller will throw an ClientAccessibleException
export const confirmEmailValidator = vine.compile(
  vine.object({
    token: vine.string(),
  })
)

export const getUserFromTokenValidator = vine.compile(
  vine.object({
    token: vine.string(),
  })
)

export const updatePasswordValidatorToken = vine.compile(
  vine.object({
    token: vine.string(),
    password: vine.string().minLength(8).trim().escape(),
  })
)

export const loginUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().escape(),
    password: vine.string().minLength(8).trim().escape(),
  })
)

export const registerUserValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .escape()
      .unique(async (db, value, _) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    username: vine
      .string()
      .minLength(3)
      .trim()
      .escape()
      .unique(async (db, value, _) => {
        const user = await db.from('users').where('username', value).first()
        return !user
      }),
    password: vine
      .string()
      .minLength(6)
      .trim()
      .escape()
      .regex(/^(?=.*[A-Z])(?=.*\d).{6,}$/),
    firstName: vine.string().trim().escape(),
    lastName: vine.string().trim().escape(),
    birthDate: vine.date(),
    schoolCode: vine.string().exists(async (db, value, _) => {
      const school = await db.from('schools').where('code', value).first()
      return school ? true : false
    }),
    termsAccepted: vine.boolean(),
  })
)
