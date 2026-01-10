import Answer from '#models/answer'
import Exam from '#models/exam'
import Matiere from '#models/matiere'
import Question from '#models/question'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Questions et Answers', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('ajout de questions à un examen', async ({ client, assert }) => {
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
      .post(`/api/exams/${exam.idExam}/questions`)
      .bearerToken(token.value!.release())
      .json({
        idQuestion: 1,
        title: 'Quelle est la capitale de la France ?',
        commentary: 'Question de géographie',
        isMultiple: false,
        isQcm: true,
        maxPoints: 2,
      })

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.exists(body.data.idQuestion)
    assert.equal(body.data.title, 'Quelle est la capitale de la France ?')
    assert.equal(body.data.maxPoints, 2)
  })

  test("récupération des questions d'un examen", async ({ client, assert }) => {
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

    await Question.create({
      title: 'Question 1',
      isMultiple: false,
      isQcm: true,
      maxPoints: 2,
      idExam: exam.idExam,
    })

    await Question.create({
      title: 'Question 2',
      isMultiple: false,
      isQcm: true,
      maxPoints: 3,
      idExam: exam.idExam,
    })

    const token = await User.accessTokens.create(teacher)

    // Act
    const response = await client
      .get(`/api/exams/${exam.idExam}/questions`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.lengthOf(body.data, 2)
  })

  test("comptage des questions d'un examen", async ({ client, assert }) => {
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

    await Question.create({
      title: 'Question 1',
      isMultiple: false,
      isQcm: true,
      maxPoints: 2,
      idExam: exam.idExam,
    })

    await Question.create({
      title: 'Question 2',
      isMultiple: false,
      isQcm: true,
      maxPoints: 3,
      idExam: exam.idExam,
    })

    const token = await User.accessTokens.create(teacher)

    // Act
    const response = await client
      .get(`/api/exams/${exam.idExam}/questions/count`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.data, 2)
  })

  test('ajout de réponses à une question QCM', async ({ client, assert }) => {
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

    const question = await Question.create({
      title: 'Quelle est la capitale de la France ?',
      isMultiple: false,
      isQcm: true,
      maxPoints: 2,
      idExam: exam.idExam,
    })

    const token = await User.accessTokens.create(teacher)

    // Act - Créer plusieurs réponses
    const response1 = await client
      .post(`/api/exams/${exam.idExam}/questions/${question.idQuestion}/answers`)
      .bearerToken(token.value!.release())
      .json({
        idAnswer: 1,
        answer: 'Paris',
        isCorrect: true,
      })

    const response2 = await client
      .post(`/api/exams/${exam.idExam}/questions/${question.idQuestion}/answers`)
      .bearerToken(token.value!.release())
      .json({
        idAnswer: 2,
        answer: 'Londres',
        isCorrect: false,
      })

    // Assert
    response1.assertStatus(200)
    response2.assertStatus(200)

    // Vérifier que les réponses ont été créées
    const answers = await Answer.query()
      .where('id_question', question.idQuestion)
      .where('id_exam', exam.idExam)

    assert.lengthOf(answers, 2)
    assert.equal(answers.filter((a) => a.isCorrect).length, 1)
  })

  test("récupération des réponses d'une question", async ({ client, assert }) => {
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

    const question = await Question.create({
      title: 'Question test',
      isMultiple: false,
      isQcm: true,
      maxPoints: 2,
      idExam: exam.idExam,
    })

    await Answer.create({
      answer: 'Réponse 1',
      isCorrect: true,
      idQuestion: question.idQuestion,
      idExam: exam.idExam,
    })

    await Answer.create({
      answer: 'Réponse 2',
      isCorrect: false,
      idQuestion: question.idQuestion,
      idExam: exam.idExam,
    })

    const token = await User.accessTokens.create(teacher)

    // Act
    const response = await client
      .get(`/api/exams/${exam.idExam}/questions/${question.idQuestion}/answers`)
      .bearerToken(token.value!.release())

    // Assert
    response.assertStatus(200)
    const body = response.body()
    assert.lengthOf(body.data, 2)
  })

  test('validation échoue pour une question sans titre', async ({ client }) => {
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
      .post(`/api/exams/${exam.idExam}/questions`)
      .bearerToken(token.value!.release())
      .json({
        // Pas de titre
        isMultiple: false,
        isQcm: true,
        maxPoints: 2,
      })

    // Assert
    response.assertStatus(422)
  })
})
