import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Auth - Login', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('utilisateur peut se connecter avec des identifiants valides', async ({
    client,
    assert,
  }) => {
    // Arrange - Créer un utilisateur de test
    const user = await User.create({
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test',
      lastName: 'User',
      accountType: 'student',
    })

    // Act - Tenter de se connecter
    const response = await client.post('/api/auth/login').json({
      email: 'test@example.com',
      password: 'Password123!',
    })

    // Assert - Vérifier la réponse
    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        idUser: user.idUser,
        email: 'test@example.com',
        accountType: 'student',
      },
    })

    // Vérifier que le token est présent
    const body = response.body()
    assert.exists(body.data.accessToken)
    assert.equal(body.data.accessToken.type, 'Bearer')
    assert.exists(body.data.accessToken.token)
  })

  test('connexion échoue avec un email inexistant', async ({ client }) => {
    // Act
    const response = await client.post('/api/auth/login').json({
      email: 'nonexistent@example.com',
      password: 'Password123!',
    })

    // Assert
    response.assertStatus(400)
    response.assertBodyContains({
      message: "Aucun compte n'est associé à cet email",
    })
  })

  test('connexion échoue avec un mauvais mot de passe', async ({ client, assert }) => {
    // Arrange
    await User.create({
      email: 'test@example.com',
      password: 'CorrectPassword123!',
      name: 'Test',
      lastName: 'User',
      accountType: 'student',
    })

    // Act
    const response = await client.post('/api/auth/login').json({
      email: 'test@example.com',
      password: 'WrongPassword123!',
    })

    // Assert
    response.assertStatus(400)
    const body = response.body()
    assert.include(body.message, 'Mot de passe incorrect')
  })

  test('validation échoue avec un email invalide', async ({ client }) => {
    // Act
    const response = await client.post('/api/auth/login').json({
      email: 'not-an-email',
      password: 'Password123!',
    })

    // Assert
    response.assertStatus(422)
  })

  test('validation échoue avec un mot de passe trop court', async ({ client }) => {
    // Act
    const response = await client.post('/api/auth/login').json({
      email: 'test@example.com',
      password: 'short',
    })

    // Assert
    response.assertStatus(422)
  })

  test('validation échoue sans email', async ({ client }) => {
    // Act
    const response = await client.post('/api/auth/login').json({
      password: 'Password123!',
    })

    // Assert
    response.assertStatus(422)
  })

  test('validation échoue sans mot de passe', async ({ client }) => {
    // Act
    const response = await client.post('/api/auth/login').json({
      email: 'test@example.com',
    })

    // Assert
    response.assertStatus(422)
  })
})
