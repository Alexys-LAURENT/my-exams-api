import Answer from '#models/answer'
import Class from '#models/class'
import Degree from '#models/degree'
import Evaluation from '#models/evaluation'
import Exam from '#models/exam'
import ExamGrade from '#models/exam_grade'
import Question from '#models/question'
import User from '#models/user'
import UserResponse from '#models/user_response'

import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { examsData } from '../../seed_data/exams_data.js'
import { classNames, firstNames, lastNames, teachersData } from '../../seed_data/seed_data.js'

export default class InsertDevDataSeeder extends BaseSeeder {
  static environment = ['development']

  private getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  async run() {
    // Date actuelle pour vérifier les examens passés
    const now = DateTime.now()

    // ============================================
    // 0. VIDER LA BASE DE DONNÉES
    // ============================================
    console.log('🔄 Nettoyage de la base de données...')
    await db.rawQuery('DELETE FROM user_responses_answers')
    await Evaluation.query().delete()
    await UserResponse.query().delete()
    await ExamGrade.query().delete()
    await db.rawQuery('DELETE FROM exams_classes')
    await Answer.query().delete()
    await Question.query().delete()
    await Exam.query().delete()
    await db.rawQuery('DELETE FROM students_classes')
    await db.rawQuery('DELETE FROM teachers_classes')
    await Class.query().delete()
    await Degree.query().delete()
    await User.query().delete()
    console.log('✅ Base de données nettoyée')

    // ============================================
    // 1. CRÉATION DES UTILISATEURS
    // ============================================
    console.log('🔄 Création des utilisateurs...')

    // 1 Admin
    const adminData = {
      email: 'admin@school.com',
      password: 'Secret123',
      name: 'Admin',
      lastName: 'User',
      accountType: 'admin' as 'admin',
    }

    // 10 Enseignants
    const teachersDataWithPassword = teachersData.map((teacher) => ({
      ...teacher,
      password: 'Secret123',
      accountType: 'teacher' as 'teacher',
    }))

    // 50 Étudiants
    const studentsData = firstNames.map((firstName, index) => ({
      email: `${firstName.toLowerCase()}.${lastNames[index].toLowerCase()}@student.com`,
      password: 'Secret123',
      name: firstName,
      lastName: lastNames[index],
      accountType: 'student' as 'student',
    }))

    await User.createMany([adminData, ...teachersDataWithPassword, ...studentsData])
    console.log('✅ Utilisateurs créés')

    // ============================================
    // 2. CRÉATION DES DIPLÔMES (ORDRE IMPORTANT)
    // ============================================
    console.log('🔄 Création des diplômes...')

    const degrees = await Degree.createMany([
      { name: 'BTS SIO 1', idDegree: 1 },
      { name: 'BTS SIO 2', idDegree: 2 },
      { name: 'Bachelor', idDegree: 3 },
      { name: 'Master 1', idDegree: 4 },
      { name: 'Master 2', idDegree: 5 },
    ])
    console.log('✅ Diplômes créés')

    // ============================================
    // 3. CRÉATION DES CLASSES
    // ============================================
    console.log('🔄 Création des classes...')

    const classesData = []
    let classId = 1
    let classNameIndex = 0

    // Années scolaires : 2023-2024, 2024-2025, 2025-2026
    const schoolYears = [
      { start: '2023-09-01', end: '2024-08-31', year: '2023-2024' },
      { start: '2024-09-01', end: '2025-08-31', year: '2024-2025' },
      { start: '2025-09-01', end: '2026-08-31', year: '2025-2026' },
    ]

    for (const degree of degrees) {
      for (const schoolYear of schoolYears) {
        // Utiliser uniquement le nom de personnalité pour la classe
        const className = classNames[classNameIndex % classNames.length]
        classNameIndex++

        classesData.push({
          idClass: classId++,
          name: className,
          idDegree: degree.idDegree,
          startDate: DateTime.fromISO(schoolYear.start),
          endDate: DateTime.fromISO(schoolYear.end),
        })
      }
    }

    const classes = await Class.createMany(classesData)
    console.log(`✅ ${classes.length} classes créées`)

    // ============================================
    // 4. ASSOCIATION DES ÉTUDIANTS AUX CLASSES (RESPECT DU PARCOURS)
    // ============================================
    console.log('🔄 Association des étudiants aux classes (respect du parcours)...')
    const students = await User.query().where('account_type', 'student')

    // Grouper les classes par année et diplôme en utilisant les dates
    const classesByYearAndDegree = {
      '2023-2024': {
        1: classes.find((c) => c.idDegree === 1 && c.startDate.year === 2023),
        2: classes.find((c) => c.idDegree === 2 && c.startDate.year === 2023),
        3: classes.find((c) => c.idDegree === 3 && c.startDate.year === 2023),
        4: classes.find((c) => c.idDegree === 4 && c.startDate.year === 2023),
        5: classes.find((c) => c.idDegree === 5 && c.startDate.year === 2023),
      },
      '2024-2025': {
        1: classes.find((c) => c.idDegree === 1 && c.startDate.year === 2024),
        2: classes.find((c) => c.idDegree === 2 && c.startDate.year === 2024),
        3: classes.find((c) => c.idDegree === 3 && c.startDate.year === 2024),
        4: classes.find((c) => c.idDegree === 4 && c.startDate.year === 2024),
        5: classes.find((c) => c.idDegree === 5 && c.startDate.year === 2024),
      },
      '2025-2026': {
        1: classes.find((c) => c.idDegree === 1 && c.startDate.year === 2025),
        2: classes.find((c) => c.idDegree === 2 && c.startDate.year === 2025),
        3: classes.find((c) => c.idDegree === 3 && c.startDate.year === 2025),
        4: classes.find((c) => c.idDegree === 4 && c.startDate.year === 2025),
        5: classes.find((c) => c.idDegree === 5 && c.startDate.year === 2025),
      },
    }

    // Assigner les étudiants avec un parcours logique
    for (const student of students) {
      // Déterminer le niveau actuel de l'étudiant (année 2025-2026)
      const currentDegreeLevel = 1 + Math.floor(Math.random() * 5) // 1 à 5

      // Créer le parcours de l'étudiant
      const studentPath = []

      // 2023-2024 : Étudiant était à currentDegreeLevel - 2
      if (currentDegreeLevel >= 3) {
        const degreeIn2023 = currentDegreeLevel - 2
        studentPath.push(classesByYearAndDegree['2023-2024'][degreeIn2023])
      }

      // 2024-2025 : Étudiant était à currentDegreeLevel - 1
      if (currentDegreeLevel >= 2) {
        const degreeIn2024 = currentDegreeLevel - 1
        studentPath.push(classesByYearAndDegree['2024-2025'][degreeIn2024])
      }

      // 2025-2026 : Étudiant est à currentDegreeLevel (année en cours)
      studentPath.push(classesByYearAndDegree['2025-2026'][currentDegreeLevel])

      // Associer l'étudiant à ses classes
      for (const classItem of studentPath) {
        if (classItem) {
          await student.related('studentClasses').attach([classItem.idClass])
        }
      }
    }
    console.log('✅ Étudiants associés aux classes avec parcours logique')

    // ============================================
    // 5. ASSOCIATION DES ENSEIGNANTS AUX CLASSES
    // ============================================
    console.log('🔄 Association des enseignants aux classes...')
    const teachers = await User.query().where('account_type', 'teacher')

    // Chaque enseignant enseigne dans 5 à 8 classes
    for (const teacher of teachers) {
      const teacherClasses = this.getRandomElements(classes, 5 + Math.floor(Math.random() * 4))
      await teacher.related('teacherClasses').attach(teacherClasses.map((c) => c.idClass))
    }
    console.log('✅ Enseignants associés aux classes')

    // ============================================
    // 6. CRÉATION DES EXAMENS À PARTIR DES DONNÉES STRUCTURÉES
    // ============================================
    console.log('🔄 Création des examens à partir des données structurées...')

    const exams = []
    let examId = 1

    // Chaque enseignant crée plusieurs examens à partir des données structurées
    for (const teacher of teachers) {
      const numExams = Math.min(3 + Math.floor(Math.random() * 3), examsData.length)

      // Sélectionner des examens aléatoires depuis examsData
      const selectedExamsData = this.getRandomElements(examsData, numExams)

      for (const examData of selectedExamsData) {
        const exam = await Exam.create({
          idExam: examId++,
          title: examData.title,
          desc: examData.desc,
          idTeacher: teacher.idUser,
          imagePath: null,
          time: examData.time,
        })
        exams.push({ exam, examData })
      }
    }
    console.log(`✅ ${exams.length} examens créés`)

    // ============================================
    // 7. CRÉATION DES QUESTIONS ET RÉPONSES À PARTIR DES DONNÉES STRUCTURÉES
    // ============================================
    console.log('🔄 Création des questions et réponses à partir des données structurées...')

    for (const { exam, examData } of exams) {
      let questionId = 1
      let answerId = 1

      for (const questionData of examData.questions) {
        const question = await Question.create({
          idQuestion: questionId++,
          idExam: exam.idExam,
          title: questionData.title,
          commentary: questionData.commentary,
          isMultiple: questionData.isMultiple,
          isQcm: questionData.isQcm,
          maxPoints: questionData.maxPoints,
        })

        // Créer les réponses si c'est une question QCM
        if (questionData.isQcm && questionData.answers) {
          for (const answerData of questionData.answers) {
            await Answer.create({
              idAnswer: answerId++,
              idQuestion: question.idQuestion,
              idExam: exam.idExam,
              answer: answerData.answer,
              isCorrect: answerData.isCorrect,
            })
          }
        }
      }
    }
    console.log('✅ Questions et réponses créées')

    // ============================================
    // 8. ASSOCIATION DES EXAMENS AUX CLASSES (SEULEMENT SI LE PROF Y ENSEIGNE)
    // ============================================
    console.log('🔄 Association des examens aux classes...')

    for (const { exam } of exams) {
      // Récupérer les classes de l'enseignant
      const teacher = await User.findOrFail(exam.idTeacher)
      await teacher.load('teacherClasses')

      const teacherClasses = teacher.teacherClasses

      // Vérifier que l'enseignant a des classes
      if (teacherClasses.length === 0) {
        console.log(`   ⚠️  L'enseignant ${teacher.name} n'a pas de classes, examen non associé`)
        continue
      }

      // Associer l'examen à 1 à 3 classes de l'enseignant (SEULEMENT ses classes)
      const numClassesForExam = 1 + Math.floor(Math.random() * Math.min(3, teacherClasses.length))
      const selectedClasses = this.getRandomElements(teacherClasses, numClassesForExam)

      for (const classItem of selectedClasses) {
        // Dates de l'examen dans la période de la classe
        const classStart = classItem.startDate
        const classEnd = classItem.endDate

        // Décider si l'examen est dans le passé, présent ou futur
        // 70% dans le passé, 20% en cours, 10% dans le futur
        const examTimingRandom = Math.random()
        let startDate: DateTime
        let endDate: DateTime

        if (examTimingRandom < 0.7) {
          // Examen dans le passé (déjà terminé)
          // Date de début : entre le début de la classe et le minimum entre (3 mois avant aujourd'hui, fin de classe)
          const latestPossibleStart = DateTime.min(
            now.minus({ months: 1 }),
            classEnd.minus({ weeks: 2 })
          )

          // Vérifier que la date est valide (après le début de la classe)
          if (latestPossibleStart <= classStart) {
            // Si la classe n'est pas encore assez avancée, on ne crée pas l'examen
            continue
          }

          const timeDiff = latestPossibleStart.diff(classStart, 'days').days

          if (timeDiff > 0) {
            startDate = classStart.plus({ days: Math.floor(Math.random() * timeDiff) })
          } else {
            startDate = classStart
          }

          // Date de fin : 1 à 2 semaines après la date de début, mais AVANT la fin de la classe ET avant aujourd'hui
          endDate = startDate.plus({ weeks: 1 + Math.floor(Math.random() * 2) })

          // S'assurer que endDate ne dépasse pas la fin de la classe
          if (endDate > classEnd) {
            endDate = classEnd
          }

          // S'assurer que endDate ne dépasse pas aujourd'hui
          if (endDate > now) {
            endDate = now.minus({ days: 1 })
          }
        } else if (examTimingRandom < 0.9) {
          // Examen en cours (date de début passée, date de fin future)
          // Vérifier que la classe est en cours (pas terminée)
          if (classEnd < now) {
            // La classe est terminée, on ne peut pas avoir d'examen en cours
            continue
          }

          startDate = DateTime.max(
            classStart,
            now.minus({ days: 1 + Math.floor(Math.random() * 7) })
          )

          endDate = DateTime.min(classEnd, now.plus({ days: 1 + Math.floor(Math.random() * 7) }))

          // Vérifier que startDate < endDate
          if (startDate >= endDate) {
            continue
          }
        } else {
          // Examen futur (date de début future)
          // Vérifier que la classe n'est pas terminée
          if (classEnd < now) {
            // La classe est terminée, on ne peut pas avoir d'examen futur
            continue
          }

          // Date de début : entre maintenant et la fin de la classe moins 2 semaines
          const latestStartDate = classEnd.minus({ weeks: 2 })

          if (latestStartDate <= now) {
            // Pas assez de temps pour un examen futur
            continue
          }

          const daysDiff = latestStartDate.diff(now, 'days').days
          startDate = now.plus({ days: 1 + Math.floor(Math.random() * Math.max(1, daysDiff)) })

          // Date de fin : 1 à 2 semaines après, mais AVANT la fin de la classe
          endDate = startDate.plus({ weeks: 1 + Math.floor(Math.random() * 2) })

          if (endDate > classEnd) {
            endDate = classEnd
          }

          // Vérifier que startDate < endDate
          if (startDate >= endDate) {
            continue
          }
        }

        await classItem.related('exams').attach({
          [exam.idExam]: {
            start_date: startDate.toJSDate(),
            end_date: endDate.toJSDate(),
          },
        })
      }
    }
    console.log('✅ Examens associés aux classes (uniquement celles où le prof enseigne)')

    // ============================================
    // 9. GÉNÉRATION DES PARTICIPATIONS (EXAM_GRADES) ET RÉPONSES
    // ============================================
    console.log('🔄 Génération des participations et réponses des étudiants...')

    for (const { exam, examData } of exams) {
      // Charger les questions de l'examen
      const questions = await Question.query().where('id_exam', exam.idExam)
      const hasCustomQuestion = questions.some((q) => !q.isQcm)

      // Charger les classes associées à cet examen
      await exam.load('classes')

      for (const classItem of exam.classes) {
        // Récupérer les dates de l'examen pour cette classe
        const pivotData = await db
          .from('exams_classes')
          .where('id_exam', exam.idExam)
          .where('id_class', classItem.idClass)
          .first()

        const examEndDate = DateTime.fromJSDate(pivotData.end_date)

        // Si l'examen n'est pas encore terminé, les étudiants ne peuvent pas l'avoir fait
        if (examEndDate > now) {
          continue
        }

        // Charger les étudiants de cette classe
        await classItem.load('students')

        // Pour chaque étudiant de la classe, décider de son statut
        for (const student of classItem.students) {
          // 10% des étudiants n'ont pas encore fait l'examen (pas de ligne dans exam_grades)
          if (Math.random() < 0.1) {
            continue
          }

          // 90% font l'examen
          if (Math.random() < 0.9) {
            // L'étudiant participe à l'examen
            let examGradeStatus: 'en cours' | 'à corrigé' | 'corrigé'
            let finalNote: number | null = null

            // Créer toutes les réponses de l'étudiant
            const userResponses = []

            for (const [i, question] of questions.entries()) {
              const questionData = examData.questions[i]

              // L'étudiant répond à TOUTES les questions
              let customAnswer = null
              if (!question.isQcm && questionData.possibleCustomAnswers) {
                // Choisir une réponse aléatoire parmi les possibles
                customAnswer = this.getRandomElement(questionData.possibleCustomAnswers)
              }

              const userResponse = await UserResponse.create({
                idUser: student.idUser,
                idQuestion: question.idQuestion,
                idExam: exam.idExam,
                custom: customAnswer,
              })
              userResponses.push(userResponse)

              if (question.isQcm) {
                // Pour les questions QCM, sélectionner des réponses
                const answers = await Answer.query()
                  .where('id_question', question.idQuestion)
                  .where('id_exam', exam.idExam)

                if (question.isMultiple) {
                  // Choisir 1 à 3 réponses
                  const numAnswers = 1 + Math.floor(Math.random() * Math.min(3, answers.length))
                  const selectedAnswers = this.getRandomElements(answers, numAnswers)

                  for (const answer of selectedAnswers) {
                    await db.table('user_responses_answers').insert({
                      id_user_response: userResponse.idUserResponse,
                      id_answer: answer.idAnswer,
                      id_question: question.idQuestion,
                      id_exam: exam.idExam,
                    })
                  }
                } else {
                  // Choisir 1 réponse
                  const selectedAnswer = this.getRandomElement(answers)
                  await db.table('user_responses_answers').insert({
                    id_user_response: userResponse.idUserResponse,
                    id_answer: selectedAnswer.idAnswer,
                    id_question: question.idQuestion,
                    id_exam: exam.idExam,
                  })
                }

                // Auto-évaluer les QCM (TOUJOURS, même si l'examen a des questions custom)
                const selectedAnswerIds = await db
                  .from('user_responses_answers')
                  .where('id_user_response', userResponse.idUserResponse)
                  .select('id_answer')

                const selectedAnswers = await Answer.query()
                  .where('id_question', question.idQuestion)
                  .where('id_exam', exam.idExam)
                  .whereIn(
                    'id_answer',
                    selectedAnswerIds.map((r) => r.id_answer)
                  )

                const correctAnswers = await Answer.query()
                  .where('id_question', question.idQuestion)
                  .where('id_exam', exam.idExam)
                  .where('is_correct', true)

                let note = 0
                if (question.isMultiple) {
                  // Pour les questions multiples, note proportionnelle
                  const correctCount = selectedAnswers.filter((a) => a.isCorrect).length
                  const incorrectCount = selectedAnswers.filter((a) => !a.isCorrect).length
                  const totalCorrect = correctAnswers.length

                  if (incorrectCount === 0 && correctCount === totalCorrect) {
                    note = question.maxPoints
                  } else if (incorrectCount === 0) {
                    note = (question.maxPoints * correctCount) / totalCorrect
                  } else {
                    note = 0
                  }
                } else {
                  // Pour les questions simples
                  note = selectedAnswers[0]?.isCorrect ? question.maxPoints : 0
                }

                // Créer l'évaluation pour la question QCM
                await Evaluation.create({
                  idStudent: student.idUser,
                  idTeacher: exam.idTeacher,
                  idUserResponse: userResponse.idUserResponse,
                  note: Math.round(note * 100) / 100,
                  commentary: selectedAnswers[0]?.isCorrect
                    ? 'Bonne réponse !'
                    : 'Réponse incorrecte',
                })
              }
            }

            // Déterminer le statut de l'exam_grade
            if (hasCustomQuestion) {
              // Il y a des questions custom
              // 70% des examens sont corrigés, 30% sont à corriger
              if (Math.random() < 0.7) {
                // Examen corrigé : le prof a évalué les questions custom
                examGradeStatus = 'corrigé'

                // Évaluer les questions custom
                for (const userResponse of userResponses) {
                  const question = questions.find((q) => q.idQuestion === userResponse.idQuestion)
                  if (question && !question.isQcm) {
                    // Note aléatoire entre 40% et 100% de la note max
                    const note = question.maxPoints * (0.4 + Math.random() * 0.6)

                    await Evaluation.create({
                      idStudent: student.idUser,
                      idTeacher: exam.idTeacher,
                      idUserResponse: userResponse.idUserResponse,
                      note: Math.round(note * 100) / 100,
                      commentary:
                        "Bonne analyse globale. Points positifs : clarté de l'explication. Points à améliorer : manque d'exemples concrets.",
                    })
                  }
                }

                // Calculer la note totale - La somme des notes des évaluations = note finale sur 20
                const allEvaluations = await Evaluation.query().whereIn(
                  'id_user_response',
                  userResponses.map((ur) => ur.idUserResponse)
                )

                // Convertir les notes en nombres et additionner
                const totalNote = allEvaluations.reduce(
                  (sum, evaluation) => sum + Number(evaluation.note || 0),
                  0
                )

                // La note finale est simplement la somme des notes (déjà sur 20)
                finalNote = Math.round(totalNote * 100) / 100
              } else {
                // Examen à corriger : le prof n'a pas encore corrigé les questions custom
                examGradeStatus = 'à corrigé'
                finalNote = null
              }
            } else {
              // Examen full QCM, calculer automatiquement la note
              examGradeStatus = 'corrigé'

              // Récupérer TOUTES les évaluations pour cet étudiant sur cet examen
              const allEvaluations = await Evaluation.query().whereIn(
                'id_user_response',
                userResponses.map((ur) => ur.idUserResponse)
              )

              // Convertir les notes en nombres et additionner
              const totalNote = allEvaluations.reduce(
                (sum, evaluation) => sum + Number(evaluation.note || 0),
                0
              )

              // La note finale est simplement la somme des notes (déjà sur 20)
              finalNote = Math.round(totalNote * 100) / 100
            }

            // Créer l'exam_grade
            await ExamGrade.create({
              idUser: student.idUser,
              idExam: exam.idExam,
              idClass: classItem.idClass,
              status: examGradeStatus,
              note: finalNote,
            })
          }
        }
      }
    }
    console.log('✅ Participations et réponses générées')

    // Récupérer les statistiques finales
    const finalStudents = await User.query().where('account_type', 'student')
    const finalTeachers = await User.query().where('account_type', 'teacher')
    const totalQuestions = await Question.query().count('* as total')
    const totalExamGrades = await ExamGrade.query().count('* as total')
    const totalExamsClasses = await db.from('exams_classes').count('* as total')

    console.log('')
    console.log('🎉 Seeder terminé avec succès !')
    console.log(`📊 Résumé :`)
    console.log(`   - ${finalStudents.length} étudiants`)
    console.log(`   - ${finalTeachers.length} enseignants`)
    console.log(`   - 1 admin`)
    console.log(`   - ${degrees.length} diplômes`)
    console.log(`   - ${classes.length} classes`)
    console.log(`   - ${exams.length} examens`)
    console.log(`   - ${totalQuestions[0].$extras.total} questions au total`)
    console.log(`   - ${totalExamsClasses[0].total} associations examen-classe`)
    console.log(`   - ${totalExamGrades[0].$extras.total} participations d'étudiants`)
  }
}
