/* eslint-disable @typescript-eslint/naming-convention */
import ClientAccessibleException from '#exceptions/client_accessible_exception'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import limiter from '@adonisjs/limiter/services/main'
import UsersRepository from '../../app/repositories/users_repository.js'
import AbstractController from '../abstract_controller.js'
import { loginUserValidator } from './validators.js'

@inject()
export default class AuthController extends AbstractController {
  constructor() {
    super()
  }

  /**
   * Login a user
   */
  @inject()
  public async login({ request }: HttpContext, usersRepository: UsersRepository) {
    const { email, password } = await request.validateUsing(loginUserValidator)

    /**
     * Create a limiter to prevent brute force attacks
     */
    const loginLimiter = limiter.use({
      requests: 4,
      duration: '2 mins',
      blockDuration: '20 mins',
      inMemoryBlockDuration: '1 min',
      inMemoryBlockOnConsumed: 6,
    })

    /**
     * Use IP address + email combination. This ensures if an
     * attacker is misusing emails; we do not block actual
     * users from logging in and only penalize the attacker
     * IP address.
     */
    const key = `login_${request.ip()}_${email}`

    /**
     * Find a user by email. Return error if a user does
     * not exists
     */
    let user: User | null = null
    try {
      user = await usersRepository.findOrFailUserByEmail(email)
    } catch (_) {
      throw new ClientAccessibleException("Aucun compte n'est associé à cet email")
    }

    /**
     * Verify the password using the hash service
     */
    const does_password_match = await hash.verify(user.password, password)
    if (!does_password_match) {
      // Consume the limiter to block the IP address
      await loginLimiter.consume(key)
      const remainingAttempts = await loginLimiter.remaining(key)
      throw new ClientAccessibleException(
        `Mot de passe incorrect. ${remainingAttempts} tentative(s) restante(s).`
      )
    }

    // Générer un access token
    const access_token = await User.accessTokens.create(user)

    return this.buildJSONResponse({
      data: {
        idUser: user.$attributes.idUser,
        lastName: user.$attributes.lastName,
        name: user.$attributes.name,
        email: user.$attributes.email,
        avatarPath: user.$attributes.avatarPath,
        accountType: user.$attributes.accountType,
        accessToken: {
          type: 'Bearer',
          token: access_token.value?.release(),
          expiresAt: access_token.expiresAt,
        },
      },
    })
  }

  public async logout({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const token = user.currentAccessToken
    await User.accessTokens.delete(user, token.identifier)
    return this.buildJSONResponse({ message: 'Logged out successfully' })
  }
}
