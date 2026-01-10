import Class from '#models/class'
import Degree from '#models/degree'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import Matiere from '#models/matiere'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Exams - Workflow Étudiant', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('étudiant peut démarrer un examen assigné', async ({ client, assert }) => {
    // Arrange
    const student = await User.create({
      email: 'student@example.com',
      password: 'Password123!',
      name: 'Student',
      lastName: 'Test',
      accountType: 'student',
    })

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

    // Associer l'étudiant à la classe
    await theClass.related('students').attach([student.idUser])

    // Associer l'examen à la classe avec dates valides
    await theClass.related('exams').attach({
      [exam.idExam]: {
        start_date: DateTime.now().minus({ hours: 1 }).toSQL(),
        end_date: DateTime.now().plus({ hours: 2 }).toSQL(),
      },
    })

    const token = await User.accessTokens.create(student)

    // Act
    const response = await client
      .post(
        `/api/classes/${theClass.idClass}/students/${student.idUser}/exams/${exam.idExam}/start`
      )
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)

    // Vérifier qu'un ExamGrade a été créé
    const examGrade = await ExamGrade.query()
      .where('id_user', student.idUser)
      .where('id_exam', exam.idExam)
      .where('id_class', theClass.idClass)
      .first()

    assert.exists(examGrade)
    assert.equal(examGrade!.status, 'en cours')
  })

  test('étudiant peut arrêter un examen en cours', async ({ client, assert }) => {
    // Arrange
    const student = await User.create({
      email: 'student@example.com',
      password: 'Password123!',
      name: 'Student',
      lastName: 'Test',
      accountType: 'student',
    })

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

    await theClass.related('students').attach([student.idUser])
    await theClass.related('exams').attach({
      [exam.idExam]: {
        start_date: DateTime.now().minus({ hours: 1 }).toSQL(),
        end_date: DateTime.now().plus({ hours: 2 }).toSQL(),
      },
    })

    const token = await User.accessTokens.create(student)

    // D'abord démarrer l'examen pour qu'il soit dans activeExams
    await client
      .post(
        `/api/classes/${theClass.idClass}/students/${student.idUser}/exams/${exam.idExam}/start`
      )
      .bearerToken(token.value!.release())

    // Act - Maintenant arrêter l'examen
    const response = await client
      .post(`/api/classes/${theClass.idClass}/students/${student.idUser}/exams/${exam.idExam}/stop`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)

    // Vérifier que l'examen a bien été terminé
    const examGrade = await ExamGrade.query()
      .where('id_user', student.idUser)
      .where('id_exam', exam.idExam)
      .where('id_class', theClass.idClass)
      .firstOrFail()

    assert.notEqual(examGrade.status, 'en cours')
  })

  test('étudiant peut récupérer les examens pending', async ({ client, assert }) => {
    // Arrange
    const student = await User.create({
      email: 'student@example.com',
      password: 'Password123!',
      name: 'Student',
      lastName: 'Test',
      accountType: 'student',
    })

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

    // Examen en cours (pending)
    const pendingExam = await Exam.create({
      title: 'Examen Pending',
      desc: 'Description',
      time: 3600,
      idTeacher: teacher.idUser,
      idMatiere: matiere.idMatiere,
    })

    await theClass.related('students').attach([student.idUser])
    await theClass.related('exams').attach({
      [pendingExam.idExam]: {
        start_date: DateTime.now().minus({ hours: 1 }).toSQL(),
        end_date: DateTime.now().plus({ hours: 2 }).toSQL(),
      },
    })

    const token = await User.accessTokens.create(student)

    // Act
    const response = await client
      .get(`/api/classes/${theClass.idClass}/students/${student.idUser}/exams/pending`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.isArray(body.data)
    assert.isAtLeast(body.data.length, 1)
    assert.equal(body.data[0].idExam, pendingExam.idExam)
  })

  test('étudiant peut récupérer les examens à venir', async ({ client, assert }) => {
    // Arrange
    const student = await User.create({
      email: 'student@example.com',
      password: 'Password123!',
      name: 'Student',
      lastName: 'Test',
      accountType: 'student',
    })

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

    // Examen futur
    const futureExam = await Exam.create({
      title: 'Examen Futur',
      desc: 'Description',
      time: 3600,
      idTeacher: teacher.idUser,
      idMatiere: matiere.idMatiere,
    })

    await theClass.related('students').attach([student.idUser])
    await theClass.related('exams').attach({
      [futureExam.idExam]: {
        start_date: DateTime.now().plus({ days: 2 }).toSQL(),
        end_date: DateTime.now().plus({ days: 3 }).toSQL(),
      },
    })

    const token = await User.accessTokens.create(student)

    // Act
    const response = await client
      .get(`/api/classes/${theClass.idClass}/students/${student.idUser}/exams/comming`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.isArray(body.data)
    assert.isAtLeast(body.data.length, 1)
    assert.equal(body.data[0].idExam, futureExam.idExam)
  })
})
