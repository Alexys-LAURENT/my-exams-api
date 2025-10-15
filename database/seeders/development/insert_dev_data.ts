import Answer from '#models/answer'
import Class from '#models/class'
import Degree from '#models/degree'
import Exam from '#models/exam'
import Question from '#models/question'
import User from '#models/user'

import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

export default class InsertDevDataSeeder extends BaseSeeder {
  static environment = ['development']
  async run() {
    await User.updateOrCreateMany('email', [
      {
        email: 'john@doe.com',
        password: 'Secret123',
        name: 'John',
        lastName: 'Doe',
        accountType: 'student' as 'student',
      },
      {
        email: 'teacher@school.com',
        password: 'Secret123',
        name: 'Jane',
        lastName: 'Smith',
        accountType: 'teacher' as 'teacher',
      },
      {
        email: 'admin@school.com',
        password: 'Secret123',
        name: 'Admin',
        lastName: 'User',
        accountType: 'admin' as 'admin',
      },
    ])

    // await UserFactory.merge({
    //   email: 'john@doe.com',
    //   password: 'Secret123',
    //   name: 'John',
    //   lastName: 'Doe',
    //   accountType: 'student',
    // }).create()

    // await UserFactory.merge({
    //   email: 'teacher@school.com',
    //   password: 'Secret123',
    //   name: 'Jane',
    //   lastName: 'Smith',
    //   accountType: 'teacher',
    // }).create()

    // await UserFactory.merge({
    //   email: 'admin@school.com',
    //   password: 'Secret123',
    //   name: 'Admin',
    //   lastName: 'User',
    //   accountType: 'admin',
    // }).create()

    await Class.query().delete()
    await Degree.query().delete()
    await Exam.query().delete()
    await Question.query().delete()
    await Answer.query().delete()

    const degrees = await Degree.updateOrCreateMany('idDegree', [
      { name: 'BTS SIO 1', idDegree: 1 },
      { name: 'BTS SIO 2', idDegree: 2 },
      { name: 'Bachelor', idDegree: 3 },
      { name: 'Master 1', idDegree: 4 },
      { name: 'Master 2', idDegree: 5 },
    ])

    const classes = await Class.updateOrCreateMany('idClass', [
      {
        idClass: 1,
        idDegree: degrees.find((d) => d.name === 'BTS SIO 1')!.idDegree,
        startDate: DateTime.fromJSDate(new Date('2021-09-01')),
        endDate: DateTime.fromJSDate(new Date('2022-08-31')),
      },
      {
        idClass: 2,
        idDegree: degrees.find((d) => d.name === 'BTS SIO 2')!.idDegree,
        startDate: DateTime.fromJSDate(new Date('2022-09-01')),
        endDate: DateTime.fromJSDate(new Date('2023-08-31')),
      },
      {
        idClass: 3,
        idDegree: degrees.find((d) => d.name === 'Bachelor')!.idDegree,
        startDate: DateTime.fromJSDate(new Date('2023-09-01')),
        endDate: DateTime.fromJSDate(new Date('2024-08-31')),
      },
      {
        idClass: 4,
        idDegree: degrees.find((d) => d.name === 'Master 1')!.idDegree,
        startDate: DateTime.fromJSDate(new Date('2024-09-01')),
        endDate: DateTime.fromJSDate(new Date('2025-08-31')),
      },
      {
        idClass: 5,
        idDegree: degrees.find((d) => d.name === 'Master 2')!.idDegree,
        startDate: DateTime.fromJSDate(new Date('2025-09-01')),
        endDate: DateTime.fromJSDate(new Date('2026-08-31')),
      },
    ])

    const student = await User.findByOrFail('email', 'john@doe.com')
    await student.related('studentClasses').attach(classes.map((c) => c.idClass))
    const teacher = await User.findByOrFail('email', 'teacher@school.com')
    await teacher.related('teacherClasses').attach(classes.map((c) => c.idClass))

    const exam = await Exam.create({
      title: 'Math Exam',
      desc: 'Final math exam for the semester',
      idTeacher: teacher.idUser,
      imagePath: null,
      time: 90,
    })

    await classes
      .find((c) => c.idDegree === degrees.find((d) => d.name === 'Master 2')!.idDegree)!
      .related('exams')
      .attach({
        [exam.idExam]: {
          start_date: DateTime.fromJSDate(new Date('2025-09-01')),
          end_date: DateTime.fromJSDate(new Date('2026-08-31')),
        },
      })

    const questions = await Question.createMany([
      {
        idQuestion: 1,
        idExam: exam.idExam,
        title: 'What is 2 + 2?',
        commentary: 'Basic arithmetic question',
        isMultiple: false,
        isQcm: true,
        maxPoints: 5,
      },
      {
        idQuestion: 2,
        idExam: exam.idExam,
        title: 'Solve for x: 2x + 3 = 7',
        commentary: 'Simple algebraic equation',
        isMultiple: false,
        isQcm: true,
        maxPoints: 5,
      },
      {
        idQuestion: 3,
        idExam: exam.idExam,
        title: 'Explain the Pythagorean theorem.',
        commentary: 'Open-ended question about geometry',
        isMultiple: false,
        isQcm: false,
        maxPoints: 5,
      },
      {
        idQuestion: 4,
        idExam: exam.idExam,
        title: 'What is the derivative of x^2?',
        commentary: 'Calculus question on derivatives',
        isMultiple: false,
        isQcm: true,
        maxPoints: 5,
      },
    ])

    const answers = await Answer.createMany([
      {
        idAnswer: 1,
        idQuestion: questions[0].idQuestion,
        idExam: exam.idExam,
        answer: '3',
        isCorrect: false,
      },
      {
        idAnswer: 2,
        idQuestion: questions[0].idQuestion,
        idExam: exam.idExam,
        answer: '4',
        isCorrect: true,
      },
      {
        idAnswer: 1,
        idQuestion: questions[1].idQuestion,
        idExam: exam.idExam,
        answer: '1',
        isCorrect: false,
      },
      {
        idAnswer: 2,
        idQuestion: questions[1].idQuestion,
        idExam: exam.idExam,
        answer: '2',
        isCorrect: true,
      },
      {
        idAnswer: 1,
        idQuestion: questions[3].idQuestion,
        idExam: exam.idExam,
        answer: '2x',
        isCorrect: true,
      },
      {
        idAnswer: 2,
        idQuestion: questions[3].idQuestion,
        idExam: exam.idExam,
        answer: 'x',
        isCorrect: false,
      },
    ])
  }
}
