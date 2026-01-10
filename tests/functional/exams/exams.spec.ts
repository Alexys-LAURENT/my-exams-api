import Class from '#models/class'
import Degree from '#models/degree'
import Exam from '#models/exam'
import Matiere from '#models/matiere'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Exams - CRUD', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('professeur peut créer un examen', async ({ client, assert }) => {
    // Arrange
    const teacher = await User.create({
      email: 'teacher@example.com',
      password: 'Password123!',
      name: 'Teacher',
      lastName: 'Test',
      accountType: 'teacher',
    })

    const matiere = await Matiere.create({
      nom: 'Mathématiques',
    })

    const token = await User.accessTokens.create(teacher)

    // Act
    const response = await client.post('/api/exams').bearerToken(token.value!.release()).json({
      title: 'Examen de Mathématiques',
      desc: 'Test de fin de semestre',
      time: 3600,
      idMatiere: matiere.idMatiere,
      idTeacher: teacher.idUser,
    })

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.exists(body.data.idExam)
    assert.equal(body.data.title, 'Examen de Mathématiques')
    assert.equal(body.data.time, 3600)
    assert.equal(body.data.idTeacher, teacher.idUser)
  })

  test("récupération d'un examen par son ID", async ({ client, assert }) => {
    // Arrange
    const teacher = await User.create({
      email: 'teacher@example.com',
      password: 'Password123!',
      name: 'Teacher',
      lastName: 'Test',
      accountType: 'teacher',
    })

    const matiere = await Matiere.create({
      nom: 'Mathématiques',
    })

    const exam = await Exam.create({
      title: 'Examen Test',
      desc: 'Description',
      time: 3600,
      idTeacher: teacher.idUser,
      idMatiere: matiere.idMatiere,
    })

    const token = await User.accessTokens.create(teacher)

    // Act
    const response = await client
      .get(`/api/exams/${exam.idExam}`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.data.idExam, exam.idExam)
    assert.equal(body.data.title, 'Examen Test')
  })

  test("mise à jour d'un examen", async ({ client, assert }) => {
    // Arrange
    const teacher = await User.create({
      email: 'teacher@example.com',
      password: 'Password123!',
      name: 'Teacher',
      lastName: 'Test',
      accountType: 'teacher',
    })

    const matiere = await Matiere.create({
      nom: 'Mathématiques',
    })

    const exam = await Exam.create({
      title: 'Examen Original',
      desc: 'Description originale',
      time: 3600,
      idTeacher: teacher.idUser,
      idMatiere: matiere.idMatiere,
    })

    const token = await User.accessTokens.create(teacher)

    // Act
    const response = await client
      .put(`/api/exams/${exam.idExam}`)
      .bearerToken(token.value!.release())
      .json({
        title: 'Examen Modifié',
        desc: 'Description modifiée',
        time: 7200,
      })

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.data.title, 'Examen Modifié')
    assert.equal(body.data.time, 7200)
  })

  test('validation échoue lors de la création sans titre', async ({ client }) => {
    // Arrange
    const teacher = await User.create({
      email: 'teacher@example.com',
      password: 'Password123!',
      name: 'Teacher',
      lastName: 'Test',
      accountType: 'teacher',
    })

    const matiere = await Matiere.create({
      nom: 'Mathématiques',
    })

    const token = await User.accessTokens.create(teacher)

    // Act
    const response = await client.post('/api/exams').bearerToken(token.value!.release()).json({
      desc: 'Test',
      time: 3600,
      idMatiere: matiere.idMatiere,
    })

    // Assert
    response.assertStatus(422)
  })
})

test.group('Exams - Association avec Classes', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('associer un examen à une classe avec dates', async ({ client, assert }) => {
    // Arrange
    const teacher = await User.create({
      email: 'teacher@example.com',
      password: 'Password123!',
      name: 'Teacher',
      lastName: 'Test',
      accountType: 'teacher',
    })

    const degree = await Degree.create({
      name: 'Master 2',
    })

    const theClass = await Class.create({
      name: 'M2 Informatique',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ months: 6 }),
      idDegree: degree.idDegree,
    })

    const matiere = await Matiere.create({
      nom: 'Mathématiques',
    })

    const exam = await Exam.create({
      title: 'Examen Test',
      desc: 'Description',
      time: 3600,
      idTeacher: teacher.idUser,
      idMatiere: matiere.idMatiere,
    })

    const token = await User.accessTokens.create(teacher)

    const start_date = DateTime.now().plus({ days: 1 }).toISO()
    const end_date = DateTime.now().plus({ days: 2 }).toISO()

    // Act
    const response = await client
      .put(`/api/classes/${theClass.idClass}/exams/${exam.idExam}`)
      .bearerToken(token.value!.release())
      .json({
        start_date,
        end_date,
      })

    // Assert
    response.assertStatus(200)

    // Vérifier que l'association existe
    const classExams = await theClass.related('exams').query()
    assert.lengthOf(classExams, 1)
    assert.equal(classExams[0].idExam, exam.idExam)
  })

  test("récupérer les examens d'une classe", async ({ client, assert }) => {
    // Arrange
    const teacher = await User.create({
      email: 'teacher@example.com',
      password: 'Password123!',
      name: 'Teacher',
      lastName: 'Test',
      accountType: 'teacher',
    })

    const degree = await Degree.create({
      name: 'Master 2',
    })

    const theClass = await Class.create({
      name: 'M2 Informatique',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ months: 6 }),
      idDegree: degree.idDegree,
    })

    const matiere = await Matiere.create({
      nom: 'Mathématiques',
    })

    const exam = await Exam.create({
      title: 'Examen Test',
      desc: 'Description',
      time: 3600,
      idTeacher: teacher.idUser,
      idMatiere: matiere.idMatiere,
    })

    // Associer l'examen à la classe
    await theClass.related('exams').attach({
      [exam.idExam]: {
        start_date: DateTime.now().toSQL(),
        end_date: DateTime.now().plus({ days: 1 }).toSQL(),
      },
    })

    const token = await User.accessTokens.create(teacher)

    // Act
    const response = await client
      .get(`/api/classes/${theClass.idClass}/exams`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.lengthOf(body.data, 1)
    assert.equal(body.data[0].idExam, exam.idExam)
  })

  test("supprimer un examen d'une classe", async ({ client, assert }) => {
    // Arrange
    const teacher = await User.create({
      email: 'teacher@example.com',
      password: 'Password123!',
      name: 'Teacher',
      lastName: 'Test',
      accountType: 'teacher',
    })

    const degree = await Degree.create({
      name: 'Master 2',
    })

    const theClass = await Class.create({
      name: 'M2 Informatique',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ months: 6 }),
      idDegree: degree.idDegree,
    })

    const matiere = await Matiere.create({
      nom: 'Mathématiques',
    })

    const exam = await Exam.create({
      title: 'Examen Test',
      desc: 'Description',
      time: 3600,
      idTeacher: teacher.idUser,
      idMatiere: matiere.idMatiere,
    })

    // Associer l'examen
    await theClass.related('exams').attach({
      [exam.idExam]: {
        start_date: DateTime.now().toSQL(),
        end_date: DateTime.now().plus({ days: 1 }).toSQL(),
      },
    })

    const token = await User.accessTokens.create(teacher)

    // Act
    const response = await client
      .delete(`/api/classes/${theClass.idClass}/exams/${exam.idExam}`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)

    // Vérifier que l'association a été supprimée
    const classExams = await theClass.related('exams').query()
    assert.lengthOf(classExams, 0)
  })
})
