import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Ownership middleware to ensure users can only access their own data.
 * Verifies that the route parameter matches the authenticated user's ID.
 * Must be used after auth middleware.
 *
 * Options:
 * - paramName: The route parameter name to check (e.g., 'idStudent', 'idTeacher', 'idUser')
 * - allowRoles: Optional array of roles that bypass the ownership check (e.g., admin can view anyone)
 */
export default class OwnershipMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      paramName: string
      allowRoles?: ('student' | 'teacher' | 'admin')[]
    }
  ) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.unauthorized({ message: 'Non authentifié' })
    }

    // Check if user's role bypasses ownership check
    if (options.allowRoles && options.allowRoles.includes(user.accountType)) {
      return next()
    }

    const paramValue = ctx.params[options.paramName]

    if (!paramValue) {
      return ctx.response.badRequest({
        message: `Paramètre ${options.paramName} manquant`,
      })
    }

    const paramId = Number.parseInt(paramValue, 10)

    if (Number.isNaN(paramId)) {
      return ctx.response.badRequest({
        message: `Paramètre ${options.paramName} invalide`,
      })
    }

    if (paramId !== user.idUser) {
      return ctx.response.forbidden({
        message: 'Vous ne pouvez accéder qu\'à vos propres données',
      })
    }

    return next()
  }
}
