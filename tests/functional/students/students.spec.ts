import { test } from '@japa/runner'
import User from '#models/user'
import Class from '#models/class'
import Degree from '#models/degree'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Students - CRUD', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('récupération de tous les étudiants avec pagination', async ({ client, assert }) => {
    // Arrange
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'Password123!',
      name: 'Admin',
      lastName: 'Test',
      accountType: 'admin',
    })

    // Créer quelques étudiants
    await User.create({
      email: 'student1@example.com',
      password: 'Password123!',
      name: 'Student1',
      lastName: 'Test',
      accountType: 'student',
    })

    await User.create({
      email: 'student2@example.com',
      password: 'Password123!',
      name: 'Student2',
      lastName: 'Test',
      accountType: 'student',
    })

    const token = await User.accessTokens.create(admin)

    // Act
    const response = await client
      .get('/api/students')
      .qs({ page: 1 })
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.exists(body.data)
    assert.isArray(body.data.data)
    assert.isAtLeast(body.data.data.length, 2)
  })

  test('récupération du nombre total d\'étudiants', async ({ client, assert }) => {
    // Arrange
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'Password123!',
      name: 'Admin',
      lastName: 'Test',
      accountType: 'admin',
    })

    await User.create({
      email: 'student1@example.com',
      password: 'Password123!',
      name: 'Student1',
      lastName: 'Test',
      accountType: 'student',
    })

    await User.create({
      email: 'student2@example.com',
      password: 'Password123!',
      name: 'Student2',
      lastName: 'Test',
      accountType: 'student',
    })

    const token = await User.accessTokens.create(admin)

    // Act
    const response = await client
      .get('/api/students/count')
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.exists(body.data)
    assert.isAtLeast(body.data, 2)
  })

  test('récupération d\'un étudiant par son ID', async ({ client, assert }) => {
    // Arrange
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'Password123!',
      name: 'Admin',
      lastName: 'Test',
      accountType: 'admin',
    })

    const student = await User.create({
      email: 'student@example.com',
      password: 'Password123!',
      name: 'Student',
      lastName: 'Test',
      accountType: 'student',
    })

    const token = await User.accessTokens.create(admin)

    // Act
    const response = await client
      .get(`/api/students/${student.idUser}`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.data.idUser, student.idUser)
    assert.equal(body.data.email, 'student@example.com')
  })

  test('mise à jour d\'un étudiant', async ({ client, assert }) => {
    // Arrange
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'Password123!',
      name: 'Admin',
      lastName: 'Test',
      accountType: 'admin',
    })

    const student = await User.create({
      email: 'student@example.com',
      password: 'Password123!',
      name: 'OldName',
      lastName: 'OldLastName',
      accountType: 'student',
    })

    const token = await User.accessTokens.create(admin)

    // Act
    const response = await client
      .put(`/api/students/${student.idUser}`)
      .bearerToken(token.value!.release())
      .json({
        name: 'NewName',
        lastName: 'NewLastName',
      })

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.data.name, 'NewName')
    assert.equal(body.data.lastName, 'NewLastName')
  })

  test('filtrage des étudiants par nom', async ({ client, assert }) => {
    // Arrange
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'Password123!',
      name: 'Admin',
      lastName: 'Test',
      accountType: 'admin',
    })

    await User.create({
      email: 'john@example.com',
      password: 'Password123!',
      name: 'John',
      lastName: 'Doe',
      accountType: 'student',
    })

    await User.create({
      email: 'jane@example.com',
      password: 'Password123!',
      name: 'Jane',
      lastName: 'Smith',
      accountType: 'student',
    })

    const token = await User.accessTokens.create(admin)

    // Act
    const response = await client
      .get('/api/students')
      .qs({ page: 1, filter: 'John' })
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.isArray(body.data.data)
    // Devrait contenir John mais pas Jane
    const names = body.data.data.map((s: any) => s.name)
    assert.include(names, 'John')
  })
})

test.group('Students - Relations avec Classes', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('récupération des étudiants d\'une classe', async ({ client, assert }) => {
    // Arrange
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'Password123!',
      name: 'Admin',
      lastName: 'Test',
      accountType: 'admin',
    })

    const student1 = await User.create({
      email: 'student1@example.com',
      password: 'Password123!',
      name: 'Student1',
      lastName: 'Test',
      accountType: 'student',
    })

    const student2 = await User.create({
      email: 'student2@example.com',
      password: 'Password123!',
      name: 'Student2',
      lastName: 'Test',
      accountType: 'student',
    })

    const degree = await Degree.create({
      name: 'Master 2',
    })

    const theClass = await Class.create({
      name: 'M2 Informatique',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ months: 6 }),
      endDate: DateTime.now().plus({ months: 6 }),
      idDegree: degree.idDegree,
    })

    await theClass.related('students').attach([student1.idUser, student2.idUser])

    const token = await User.accessTokens.create(admin)

    // Act
    const response = await client
      .get(`/api/classes/${theClass.idClass}/students`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.lengthOf(body.data, 2)
  })

  test('récupération des classes d\'un étudiant', async ({ client, assert }) => {
    // Arrange
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'Password123!',
      name: 'Admin',
      lastName: 'Test',
      accountType: 'admin',
    })

    const student = await User.create({
      email: 'student@example.com',
      password: 'Password123!',
      name: 'Student',
      lastName: 'Test',
      accountType: 'student',
    })

    const degree = await Degree.create({
      name: 'Master 2',
    })

    const class1 = await Class.create({
      name: 'M2 Informatique',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ months: 6 }),
      idDegree: degree.idDegree,
    })

    const class2 = await Class.create({
      name: 'M2 Mathématiques',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ months: 6 }),
      idDegree: degree.idDegree,
    })

    await class1.related('students').attach([student.idUser])
    await class2.related('students').attach([student.idUser])

    const token = await User.accessTokens.create(admin)

    // Act
    const response = await client
      .get(`/api/students/${student.idUser}/classes`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.lengthOf(body.data, 2)
  })
})
