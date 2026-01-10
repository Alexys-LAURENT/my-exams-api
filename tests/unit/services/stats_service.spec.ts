import Class from '#models/class'
import Degree from '#models/degree'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import Matiere from '#models/matiere'
import User from '#models/user'
import StatsService from '#services/stats_service'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('StatsService - Unit Tests', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test("calcul de la moyenne générale d'un étudiant retourne 0 si aucune note", async ({
    assert,
  }) => {
    // Arrange
    const statsService = new StatsService()

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

    const theClass = await Class.create({
      name: 'M2 Informatique',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ months: 6 }),
      idDegree: degree.idDegree,
    })

    await theClass.related('students').attach([student.idUser])

    // Act
    const average = await statsService.getUserGeneralAverageInClass(
      student.idUser,
      theClass.idClass
    )

    // Assert
    assert.equal(average, 0)
  })

  test("calcul de la moyenne générale d'un étudiant avec plusieurs notes", async ({ assert }) => {
    // Arrange
    const statsService = new StatsService()

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

    await ExamGrade.create({
      idUser: student.idUser,
      idExam: exam1.idExam,
      idClass: theClass.idClass,
      note: 12,
      status: 'corrigé',
    })

    await ExamGrade.create({
      idUser: student.idUser,
      idExam: exam2.idExam,
      idClass: theClass.idClass,
      note: 18,
      status: 'corrigé',
    })

    // Act
    const average = await statsService.getUserGeneralAverageInClass(
      student.idUser,
      theClass.idClass
    )

    // Assert
    assert.equal(average, 15) // (12 + 18) / 2 = 15
  })

  test("calcul de la moyenne générale d'une classe", async ({ assert }) => {
    // Arrange
    const statsService = new StatsService()

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

    await ExamGrade.create({
      idUser: student1.idUser,
      idExam: exam.idExam,
      idClass: theClass.idClass,
      note: 10,
      status: 'corrigé',
    })

    await ExamGrade.create({
      idUser: student2.idUser,
      idExam: exam.idExam,
      idClass: theClass.idClass,
      note: 20,
      status: 'corrigé',
    })

    // Act
    const average = await statsService.getGeneralAverageForClass(theClass.idClass)

    // Assert
    assert.equal(average, 15) // (10 + 20) / 2 = 15
  })

  test('calcul de la moyenne de classe pour un examen', async ({ assert }) => {
    // Arrange
    const statsService = new StatsService()

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

    await ExamGrade.create({
      idUser: student1.idUser,
      idExam: exam.idExam,
      idClass: theClass.idClass,
      note: 8,
      status: 'corrigé',
    })

    await ExamGrade.create({
      idUser: student2.idUser,
      idExam: exam.idExam,
      idClass: theClass.idClass,
      note: 12,
      status: 'corrigé',
    })

    // Act
    const average = await statsService.getGeneralAverageForClassAndForOneExam(
      theClass.idClass,
      exam.idExam
    )

    // Assert
    assert.equal(Number.parseFloat(average === 0 ? '0' : average), 10) // (8 + 12) / 2 = 10
  })

  test('retourne 0 pour une classe sans étudiants', async ({ assert }) => {
    // Arrange
    const statsService = new StatsService()

    const degree = await Degree.create({
      name: 'Master 2',
    })

    const theClass = await Class.create({
      name: 'M2 Informatique',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ months: 6 }),
      idDegree: degree.idDegree,
    })

    // Act
    const average = await statsService.getGeneralAverageForClass(theClass.idClass)

    // Assert
    assert.equal(average, 0)
  })
})
