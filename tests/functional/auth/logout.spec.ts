import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Auth - Logout', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('utilisateur authentifié peut se déconnecter', async ({ client, assert }) => {
    // Arrange - Créer un utilisateur et obtenir un token
    const user = await User.create({
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test',
      lastName: 'User',
      accountType: 'student',
    })

    const token = await User.accessTokens.create(user)

    // Act - Se déconnecter
    const response = await client.post('/api/auth/logout').bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Logged out successfully',
    })

    // Vérifier que le token a été supprimé
    const tokens = await User.accessTokens.all(user)
    assert.lengthOf(tokens, 0)
  })

  test('déconnexion échoue sans token', async ({ client }) => {
    // Act
    const response = await client.post('/api/auth/logout')

    // Assert
    response.assertStatus(401)
  })

  test('déconnexion échoue avec un token invalide', async ({ client }) => {
    // Act
    const response = await client.post('/api/auth/logout').bearerToken('invalid-token')

    // Assert
    response.assertStatus(401)
  })
})
