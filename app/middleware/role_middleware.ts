import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Role middleware to restrict access based on user account type.
 * Must be used after auth middleware to ensure user is authenticated.
 */
export default class RoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      roles: ('student' | 'teacher' | 'admin')[]
    }
  ) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.unauthorized({ message: 'Non authentifié' })
    }

    if (!options.roles.includes(user.accountType)) {
      return ctx.response.forbidden({
        message: 'Accès non autorisé pour ce type de compte',
      })
    }

    return next()
  }
}
