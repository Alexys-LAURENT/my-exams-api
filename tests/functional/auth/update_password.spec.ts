import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Auth - Update Password', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('utilisateur peut modifier son mot de passe avec le bon mot de passe actuel', async ({
    client,
    assert,
  }) => {
    // Arrange
    const user = await User.create({
      email: 'test@example.com',
      password: 'OldPassword123!',
      name: 'Test',
      lastName: 'User',
      accountType: 'student',
    })

    const token = await User.accessTokens.create(user)

    // Act
    const response = await client
      .put('/api/auth/update-password')
      .bearerToken(token.value!.release())
      .json({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!@',
      })

    // Assert
    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Mot de passe mis à jour avec succès',
    })

    // Vérifier que le mot de passe a été changé
    await user.refresh()
    const passwordMatches = await hash.verify(user.password, 'NewPassword123!@')
    assert.isTrue(passwordMatches)
  })

  test('modification échoue avec un mauvais mot de passe actuel', async ({ client }) => {
    // Arrange
    const user = await User.create({
      email: 'test@example.com',
      password: 'OldPassword123!',
      name: 'Test',
      lastName: 'User',
      accountType: 'student',
    })

    const token = await User.accessTokens.create(user)

    // Act
    const response = await client
      .put('/api/auth/update-password')
      .bearerToken(token.value!.release())
      .json({
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!@',
      })

    // Assert
    response.assertStatus(403)
    response.assertBodyContains({
      message: 'Le mot de passe actuel est incorrect',
    })
  })

  test('modification échoue sans authentification', async ({ client }) => {
    // Act
    const response = await client.put('/api/auth/update-password').json({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!@',
    })

    // Assert
    response.assertStatus(401)
  })

  test('validation échoue avec un nouveau mot de passe faible', async ({ client }) => {
    // Arrange
    const user = await User.create({
      email: 'test@example.com',
      password: 'OldPassword123!',
      name: 'Test',
      lastName: 'User',
      accountType: 'student',
    })

    const token = await User.accessTokens.create(user)

    // Act
    const response = await client
      .put('/api/auth/update-password')
      .bearerToken(token.value!.release())
      .json({
        currentPassword: 'OldPassword123!',
        newPassword: 'weak',
      })

    // Assert
    response.assertStatus(422)
  })
})
