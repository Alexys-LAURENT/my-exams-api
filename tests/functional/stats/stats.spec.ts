import Class from '#models/class'
import Degree from '#models/degree'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import Matiere from '#models/matiere'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Stats - Moyennes', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test("calcul de la moyenne générale d'un étudiant dans une classe", async ({
    client,
    assert,
  }) => {
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

    await theClass.related('students').attach([student.idUser])
    await theClass.related('teachers').attach([teacher.idUser])
    await teacher.related('matieres').attach([matiere.idMatiere])

    // Créer des examens avec des notes
    const exam1 = await Exam.create({
      title: 'Examen 1',
      time: 3600,
      idTeacher: teacher.idUser,
      idMatiere: matiere.idMatiere,
    })

    const exam2 = await Exam.create({
      title: 'Examen 2',
      time: 3600,
      idTeacher: teacher.idUser,
      idMatiere: matiere.idMatiere,
    })

    await theClass.related('exams').attach({
      [exam1.idExam]: {
        start_date: DateTime.now().minus({ days: 2 }).toSQL(),
        end_date: DateTime.now().minus({ days: 1 }).toSQL(),
      },
      [exam2.idExam]: {
        start_date: DateTime.now().minus({ days: 2 }).toSQL(),
        end_date: DateTime.now().minus({ days: 1 }).toSQL(),
      },
    })

    // Créer des notes pour l'étudiant
    await ExamGrade.create({
      idUser: student.idUser,
      idExam: exam1.idExam,
      idClass: theClass.idClass,
      note: 15,
      status: 'corrigé',
    })

    await ExamGrade.create({
      idUser: student.idUser,
      idExam: exam2.idExam,
      idClass: theClass.idClass,
      note: 17,
      status: 'corrigé',
    })

    const token = await User.accessTokens.create(student)

    // Act
    const response = await client
      .get(`/api/stats/classes/${theClass.idClass}/users/${student.idUser}/average`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.exists(body.data.average)
    assert.equal(body.data.average, 16) // (15 + 17) / 2 = 16
  })

  test('moyenne de classe pour un examen spécifique', async ({ client, assert }) => {
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
      time: 3600,
      idTeacher: teacher.idUser,
      idMatiere: matiere.idMatiere,
    })

    await theClass.related('students').attach([student1.idUser, student2.idUser])
    await theClass.related('exams').attach({
      [exam.idExam]: {
        start_date: DateTime.now().minus({ days: 2 }).toSQL(),
        end_date: DateTime.now().minus({ days: 1 }).toSQL(),
      },
    })

    // Créer des notes
    await ExamGrade.create({
      idUser: student1.idUser,
      idExam: exam.idExam,
      idClass: theClass.idClass,
      note: 14,
      status: 'corrigé',
    })

    await ExamGrade.create({
      idUser: student2.idUser,
      idExam: exam.idExam,
      idClass: theClass.idClass,
      note: 18,
      status: 'corrigé',
    })

    const token = await User.accessTokens.create(admin)

    // Act
    const response = await client
      .get(`/api/stats/exams/${exam.idExam}/classes/${theClass.idClass}/average`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.exists(body.data.average)
    // La moyenne devrait être 16 (14 + 18) / 2
    assert.approximately(Number.parseFloat(body.data.average), 16, 0.1)
  })

  test("moyenne générale d'une classe", async ({ client, assert }) => {
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

    await theClass.related('students').attach([student1.idUser, student2.idUser])
    await theClass.related('teachers').attach([teacher.idUser])
    await teacher.related('matieres').attach([matiere.idMatiere])

    const exam = await Exam.create({
      title: 'Examen Test',
      time: 3600,
      idTeacher: teacher.idUser,
      idMatiere: matiere.idMatiere,
    })

    await theClass.related('exams').attach({
      [exam.idExam]: {
        start_date: DateTime.now().minus({ days: 2 }).toSQL(),
        end_date: DateTime.now().minus({ days: 1 }).toSQL(),
      },
    })

    // Notes pour student1
    await ExamGrade.create({
      idUser: student1.idUser,
      idExam: exam.idExam,
      idClass: theClass.idClass,
      note: 15,
      status: 'corrigé',
    })

    // Notes pour student2
    await ExamGrade.create({
      idUser: student2.idUser,
      idExam: exam.idExam,
      idClass: theClass.idClass,
      note: 17,
      status: 'corrigé',
    })

    const token = await User.accessTokens.create(admin)

    // Act
    const response = await client
      .get(`/api/stats/classes/${theClass.idClass}/average`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.exists(body.data.average)
    // La moyenne devrait être 16 ((15 + 17) / 2)
    assert.approximately(body.data.average, 16, 0.1)
  })

  test('étudiant ne peut voir que sa propre moyenne', async ({ client }) => {
    // Arrange
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
      idDegree: degree.idDegree,
    })

    await theClass.related('students').attach([student1.idUser, student2.idUser])

    const token = await User.accessTokens.create(student1)

    // Act - Student1 essaie de voir la moyenne de Student2
    const response = await client
      .get(`/api/stats/classes/${theClass.idClass}/users/${student2.idUser}/average`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(400)
    response.assertBodyContains({
      message: "Vous n'êtes pas autorisé à voir cette moyenne",
    })
  })
})
