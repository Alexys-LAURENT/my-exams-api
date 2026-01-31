/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const ExamsClassesController = () => import('../controllers/exams_classes_controller/controller.js')
const EvaluationsController = () => import('../controllers/evaluations_controller/controller.js')
const ExamGradesController = () => import('../controllers/exam_grades_controller/controller.js')
const ClassesController = () => import('../controllers/classes_controller/controller.js')
const ExamsController = () => import('../controllers/exams_controller/controller.js')
const DegreesController = () => import('../controllers/degrees_controller/controller.js')
const StudentsController = () => import('../controllers/students_controller/controller.js')
const AuthController = () => import('../controllers/auth_controller/controller.js')
const AnswersController = () => import('../controllers/answers_controller/controller.js')
const QuestionsController = () => import('../controllers/questions_controller/controller.js')
const TeachersController = () => import('../controllers/teachers_controller/controller.js')
const UsersResponsesController = () =>
  import('../controllers/users_responses_controller/controller.js')
const MatieresController = () => import('../controllers/matieres_controller/controller.js')
const StatsController = () => import('../controllers/stats_controller/controller.js')

/*
 █████  ██    ██ ████████ ██   ██
██   ██ ██    ██    ██    ██   ██
███████ ██    ██    ██    ███████
██   ██ ██    ██    ██    ██   ██
██   ██  ██████     ██    ██   ██
*/

router
  .group(() => {
    // Public - login
    router.post('/login', [AuthController, 'login'])
    // Authenticated - all users
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
    router.put('/update-password', [AuthController, 'updateOwnPassword']).use(middleware.auth())
  })
  .prefix('/api/auth')

/*
 ██████ ██       █████  ███████ ███████ ███████ ███████
██      ██      ██   ██ ██      ██      ██      ██
██      ██      ███████ ███████ ███████ █████   ███████
██      ██      ██   ██      ██      ██ ██           ██
 ██████ ███████ ██   ██ ███████ ███████ ███████ ███████
*/

router
  .group(() => {
    // Admin only - list all classes
    router
      .get('/', [ClassesController, 'getAll'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - create class
    router
      .post('/', [ClassesController, 'createClass'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - update class
    router
      .put('/:idClass', [ClassesController, 'updateClass'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // All authenticated - get one class
    router
      .get(':idClass', [ClassesController, 'getOneClass'])
      .use([middleware.auth(), middleware.role({ roles: ['student', 'teacher', 'admin'] })])

    // Admin only - delete class
    router
      .delete('/:idClass', [ClassesController, 'deleteIdClass'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // All authenticated - get degrees of class
    router
      .get('/:idClasse/degrees', [DegreesController, 'getPromosOfClass'])
      .use([middleware.auth(), middleware.role({ roles: ['student', 'teacher', 'admin'] })])

    // Teacher & Admin - get students of class
    router
      .get('/:idClass/students', [StudentsController, 'getStudentsOfClass'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher', 'admin'] })])

    // Admin only - get teachers of class
    router
      .get('/:idClass/teachers', [TeachersController, 'getTeachersOfClass'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - assign student to class
    router
      .put(':idClass/students/:idStudent', [StudentsController, 'putStudentToClass'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - remove student from class
    router
      .delete(':idClass/students/:idStudent', [StudentsController, 'deleteStudentFromClass'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Teacher only - delete exam from class
    router
      .delete(':idClass/exams/:idExam', [ExamsController, 'deleteExamFromClass'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Admin only - assign teacher to class
    router
      .put(':idClass/teachers/:idTeacher', [TeachersController, 'putTeacherToClass'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - remove teacher from class
    router
      .delete(':idClass/teachers/:idTeacher', [TeachersController, 'removeTeacherFromClass'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Teacher only - assign exam to class
    router
      .put(':idClass/exams/:idExam', [ExamsController, 'putExamsForClass'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Teacher only - get all exams of class
    router
      .get(':idClass/exams', [ExamsController, 'getAllExamsOfClass'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Student (own data) & Teacher - get exams by status
    router
      .get(':idClass/students/:idStudent/exams/:status', [
        ExamsController,
        'getExamsByTypeOfStudentInClass',
      ])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['student', 'teacher'] }),
        middleware.ownership({ paramName: 'idStudent', allowRoles: ['teacher'] }),
      ])

    // Student (own data) & Teacher - count exams by status
    router
      .get(':idClass/students/:idStudent/exams/:status/count', [
        ExamsController,
        'getCountExamsByTypeOfStudentInClass',
      ])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['student', 'teacher'] }),
        middleware.ownership({ paramName: 'idStudent', allowRoles: ['teacher'] }),
      ])

    // Student (own data), Teacher & Admin - get exam grades
    router
      .get(':idClass/students/:idStudent/exams/:idExam/exam_grades', [
        ExamGradesController,
        'getExamGradeForOneStudent',
      ])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['student', 'teacher', 'admin'] }),
        middleware.ownership({ paramName: 'idStudent', allowRoles: ['teacher', 'admin'] }),
      ])

    // Student only (own data) - start exam
    router
      .post(':idClass/students/:idStudent/exams/:idExam/start', [ExamsController, 'startExam'])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['student'] }),
        middleware.ownership({ paramName: 'idStudent' }),
      ])

    // Student only (own data) - stop exam
    router
      .post(':idClass/students/:idStudent/exams/:idExam/stop', [ExamsController, 'stopExam'])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['student'] }),
        middleware.ownership({ paramName: 'idStudent' }),
      ])

    // Student only (own data) - retake exam
    router
      .post(':idClass/students/:idStudent/exams/:idExam/retake', [ExamsController, 'reTakeExam'])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['student'] }),
        middleware.ownership({ paramName: 'idStudent' }),
      ])

    // Student (own data), Teacher & Admin - get exam recap
    router
      .get(':idClass/students/:idStudent/exams/:idExam/recap', [ExamsController, 'recap'])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['student', 'teacher', 'admin'] }),
        middleware.ownership({ paramName: 'idStudent', allowRoles: ['teacher', 'admin'] }),
      ])

    // Teacher only - get classes for one exam
    router
      .get('exams/:idExam', [ClassesController, 'getClassesForOneExam'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Student (own data), Teacher & Admin - get grades summary
    router
      .get(':idClass/students/:idUser/grades-summary', [
        StatsController,
        'getUserInClassGradesSummary',
      ])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['student', 'teacher', 'admin'] }),
        middleware.ownership({ paramName: 'idUser', allowRoles: ['teacher', 'admin'] }),
      ])
  })
  .prefix('/api/classes')

/*
███████ ████████ ██    ██ ██████  ███████ ███    ██ ████████ ███████
██         ██    ██    ██ ██   ██ ██      ████   ██    ██    ██
███████    ██    ██    ██ ██   ██ █████   ██ ██  ██    ██    ███████
     ██    ██    ██    ██ ██   ██ ██      ██  ██ ██    ██         ██
███████    ██     ██████  ██████  ███████ ██   ████    ██    ███████
*/

router
  .group(() => {
    // Admin only - create student
    router
      .post('/', [StudentsController, 'createStudent'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - delete student
    router
      .delete('/:idStudent', [StudentsController, 'deleteStudent'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - update student
    router
      .put('/:idStudent', [StudentsController, 'updateStudent'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Student (own data) & Admin - get student classes
    router
      .get('/:idStudent/classes', [ClassesController, 'getStudentClasses'])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['student', 'admin'] }),
        middleware.ownership({ paramName: 'idStudent', allowRoles: ['admin'] }),
      ])

    // Admin only - get all students
    router
      .get('/', [StudentsController, 'getAll'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - get students count
    router
      .get('/count', [StudentsController, 'getAllCount'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Teacher & Admin - get one student
    router
      .get('/:idStudent', [StudentsController, 'getOneStudent'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher', 'admin'] })])
  })
  .prefix('/api/students')

/*
████████ ███████  █████   ██████ ██   ██ ███████ ██████  ███████
   ██    ██      ██   ██ ██      ██   ██ ██      ██   ██ ██
   ██    █████   ███████ ██      ███████ █████   ██████  ███████
   ██    ██      ██   ██ ██      ██   ██ ██      ██   ██      ██
   ██    ███████ ██   ██  ██████ ██   ██ ███████ ██   ██ ███████
*/

router
  .group(() => {
    // Admin only - get all teachers
    router
      .get('/', [TeachersController, 'getAll'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - get teachers count
    router
      .get('/count', [TeachersController, 'getAllCount'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // All authenticated - get one teacher
    router
      .get(':idTeacher', [TeachersController, 'getOneTeacher'])
      .use([middleware.auth(), middleware.role({ roles: ['student', 'teacher', 'admin'] })])

    // Admin only - create teacher
    router
      .post('/', [TeachersController, 'createTeacher'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Teacher (own data) - get active exams
    router
      .get('/:idTeacher/exams/active', [TeachersController, 'getActiveExamsForOneTeacher'])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['teacher'] }),
        middleware.ownership({ paramName: 'idTeacher' }),
      ])

    // Teacher (own data) - get all exams
    router
      .get('/:idTeacher/exams', [ExamsController, 'getAllExamsForOneTeacher'])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['teacher'] }),
        middleware.ownership({ paramName: 'idTeacher' }),
      ])

    // Admin only - delete teacher
    router
      .delete('/:idTeacher', [TeachersController, 'deleteTeacher'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - update teacher
    router
      .put('/:idTeacher', [TeachersController, 'updateTeacher'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Teacher (own data) & Admin - get classes
    router
      .get(':idTeacher/classes', [ClassesController, 'getAllClassesForOneTeacher'])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['teacher', 'admin'] }),
        middleware.ownership({ paramName: 'idTeacher', allowRoles: ['admin'] }),
      ])

    // Teacher (own data) & Admin - get matieres
    router
      .get('/:idTeacher/matieres', [TeachersController, 'getMatieres'])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['teacher', 'admin'] }),
        middleware.ownership({ paramName: 'idTeacher', allowRoles: ['admin'] }),
      ])
  })
  .prefix('/api/teachers')

/*
███████ ██   ██  █████  ███    ███ ███████
██       ██ ██  ██   ██ ████  ████ ██
█████     ███   ███████ ██ ████ ██ ███████
██       ██ ██  ██   ██ ██  ██  ██      ██
███████ ██   ██ ██   ██ ██      ██ ███████
*/

router
  .group(() => {
    // Student & Teacher - get questions count
    router
      .get('/:idExam/questions/count', [QuestionsController, 'getQuestionsCountForOneExam'])
      .use([middleware.auth(), middleware.role({ roles: ['student', 'teacher'] })])

    // All authenticated - get one exam
    router
      .get(':idExam', [ExamsController, 'getOneExam'])
      .use([middleware.auth(), middleware.role({ roles: ['student', 'teacher', 'admin'] })])

    // Teacher only - update exam
    router
      .put(':idExam', [ExamsController, 'updateExam'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Teacher only - create exam
    router
      .post('/', [ExamsController, 'createExam'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Teacher only - create question
    router
      .post('/:idExam/questions', [QuestionsController, 'createQuestion'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Teacher only - create answers
    router
      .post('/:idExam/questions/:idQuestion/answers', [AnswersController, 'createAnswers'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Teacher only - get all questions
    router
      .get('/:idExam/questions', [QuestionsController, 'getAllQuestionsForOneExam'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Teacher only - get exam classes
    router
      .get(':idExam/classes', [ExamsController, 'getExamClasses'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Teacher only - get answers
    router
      .get('/:idExam/questions/:idQuestion/answers', [
        AnswersController,
        'getAllAnswersForOneQuestionOfOneExam',
      ])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])
  })
  .prefix('/api/exams')

/*
██████  ███████  ██████  ██████  ███████ ███████ ███████
██   ██ ██      ██       ██   ██ ██      ██      ██
██   ██ █████   ██   ███ ██████  █████   █████   ███████
██   ██ ██      ██    ██ ██   ██ ██      ██           ██
██████  ███████  ██████  ██   ██ ███████ ███████ ███████
*/

router
  .group(() => {
    // Admin only - get all degrees
    router
      .get('/', [DegreesController, 'getAll'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - delete degree
    router
      .delete('/:idDegree', [DegreesController, 'deleteDegree'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - create degree
    router
      .post('/', [DegreesController, 'createDegree'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - update degree
    router
      .put('/:idDegree', [DegreesController, 'updateDegree'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])
  })
  .prefix('/api/degrees')

/*
██    ██ ███████ ███████ ██████  ███████     ██████  ███████ ███████ ██████   ██████  ███    ██ ███████ ███████ ███████
██    ██ ██      ██      ██   ██ ██          ██   ██ ██      ██      ██   ██ ██    ██ ████   ██ ██      ██      ██
██    ██ ███████ █████   ██████  ███████     ██████  █████   ███████ ██████  ██    ██ ██ ██  ██ ███████ █████   ███████
██    ██      ██ ██      ██   ██      ██     ██   ██ ██           ██ ██      ██    ██ ██  ██ ██      ██ ██           ██
 ██████  ███████ ███████ ██   ██ ███████     ██   ██ ███████ ███████ ██       ██████  ██   ████ ███████ ███████ ███████
*/

router
  .group(() => {
    // Student only - create user response
    router
      .post('/', [UsersResponsesController, 'createUsersResponse'])
      .use([middleware.auth(), middleware.role({ roles: ['student'] })])

    // Student only (own data verified in controller) - update user response
    router
      .put('/:idUserResponse', [UsersResponsesController, 'updateUsersResponse'])
      .use([middleware.auth(), middleware.role({ roles: ['student'] })])
  })
  .prefix('/api/users_responses')

/*
███████ ██   ██  █████  ███    ███      ██████  ██████   █████  ██████  ███████ ███████
██       ██ ██  ██   ██ ████  ████     ██       ██   ██ ██   ██ ██   ██ ██      ██
█████     ███   ███████ ██ ████ ██     ██   ███ ██████  ███████ ██   ██ █████   ███████
██       ██ ██  ██   ██ ██  ██  ██     ██    ██ ██   ██ ██   ██ ██   ██ ██           ██
███████ ██   ██ ██   ██ ██      ██      ██████  ██   ██ ██   ██ ██████  ███████ ███████
*/

router
  .group(() => {
    // Teacher only - update exam grade
    router
      .put('/:idExamGrade', [ExamGradesController, 'updateExamGrade'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Teacher & Admin - get exam grades for student in class
    router
      .get('/classes/:idClass/student/:idStudent', [
        ExamGradesController,
        'getExamGradesForStudentInOneClass',
      ])
      .use([middleware.auth(), middleware.role({ roles: ['teacher', 'admin'] })])
  })
  .prefix('/api/exam_grades')

/*
███████ ██    ██  █████  ██      ██    ██  █████  ████████ ██  ██████  ███    ██ ███████
██      ██    ██ ██   ██ ██      ██    ██ ██   ██    ██    ██ ██    ██ ████   ██ ██
█████   ██    ██ ███████ ██      ██    ██ ███████    ██    ██ ██    ██ ██ ██  ██ ███████
██       ██  ██  ██   ██ ██      ██    ██ ██   ██    ██    ██ ██    ██ ██  ██ ██      ██
███████   ████   ██   ██ ███████  ██████  ██   ██    ██    ██  ██████  ██   ████ ███████
*/

router
  .group(() => {
    // Teacher only - create evaluation
    router
      .post('/', [EvaluationsController, 'createEvaluation'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Teacher only - update evaluation
    router
      .put('/:idEvaluation', [EvaluationsController, 'updateEvaluation'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])
  })
  .prefix('/api/evaluations')

/*
███████ ██   ██  █████  ███    ███ ███████      ██████ ██       █████  ███████ ███████ ███████ ███████
██       ██ ██  ██   ██ ████  ████ ██          ██      ██      ██   ██ ██      ██      ██      ██
█████     ███   ███████ ██ ████ ██ ███████     ██      ██      ███████ ███████ ███████ █████   ███████
██       ██ ██  ██   ██ ██  ██  ██      ██     ██      ██      ██   ██      ██      ██ ██           ██
███████ ██   ██ ██   ██ ██      ██ ███████      ██████ ███████ ██   ██ ███████ ███████ ███████ ███████
*/

router
  .group(() => {
    // All authenticated - get exam class relation
    router
      .get('/exams/:idExam/classes/:idClass', [ExamsClassesController, 'getExamClassRelation'])
      .use([middleware.auth(), middleware.role({ roles: ['student', 'teacher', 'admin'] })])
  })
  .prefix('/api/exams_classes')

/*
███    ███  █████  ████████ ██ ███████ ██████  ███████ ███████
████  ████ ██   ██    ██    ██ ██      ██   ██ ██      ██
██ ████ ██ ███████    ██    ██ █████   ██████  █████   ███████
██  ██  ██ ██   ██    ██    ██ ██      ██   ██ ██           ██
██      ██ ██   ██    ██    ██ ███████ ██   ██ ███████ ███████
*/

router
  .group(() => {
    // Teacher & Admin - get all matieres
    router
      .get('/', [MatieresController, 'getAll'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher', 'admin'] })])

    // Student & Teacher - get one matiere
    router
      .get('/:idMatiere', [MatieresController, 'getMatiereFromId'])
      .use([middleware.auth(), middleware.role({ roles: ['student', 'teacher'] })])

    // Admin only - create matiere
    router
      .post('/', [MatieresController, 'createMatiere'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - update matiere
    router
      .put('/:idMatiere', [MatieresController, 'updateMatiere'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - delete matiere
    router
      .delete('/:idMatiere', [MatieresController, 'deleteMatiere'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - get teachers of matiere
    router
      .get('/:idMatiere/teachers', [MatieresController, 'getTeachers'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - add teacher to matiere
    router
      .put('/:idMatiere/teachers/:idTeacher', [MatieresController, 'addTeacherToMatiere'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Admin only - remove teacher from matiere
    router
      .delete('/:idMatiere/teachers/:idTeacher', [MatieresController, 'removeTeacherFromMatiere'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])
  })
  .prefix('/api/matieres')

/*
███████ ████████  █████  ████████ ███████
██         ██    ██   ██    ██    ██
███████    ██    ███████    ██    ███████
     ██    ██    ██   ██    ██         ██
███████    ██    ██   ██    ██    ███████
*/

router
  .group(() => {
    // Student (own data), Teacher & Admin - get user average in class
    router
      .get('/classes/:idClass/users/:idUser/average', [
        StatsController,
        'getUserGeneraleAverageInClass',
      ])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['student', 'teacher', 'admin'] }),
        middleware.ownership({ paramName: 'idUser', allowRoles: ['teacher', 'admin'] }),
      ])

    // Teacher (own data) - get average participation rate
    router
      .get('/teachers/:idTeacher/classes/:idClass/average_participation_rate', [
        StatsController,
        'getAverageParticipationRate',
      ])
      .use([
        middleware.auth(),
        middleware.role({ roles: ['teacher'] }),
        middleware.ownership({ paramName: 'idTeacher' }),
      ])

    // Teacher only - get class average for exam
    router
      .get('/exams/:idExam/classes/:idClass/average', [StatsController, 'getClassAverageForExam'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Teacher only - get most failed questions
    router
      .get('/exams/:idExam/most_failed_questions', [StatsController, 'getMostFailedQuestions'])
      .use([middleware.auth(), middleware.role({ roles: ['teacher'] })])

    // Admin only - get class general average
    router
      .get('/classes/:idClass/average', [StatsController, 'getClassGeneralAverage'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])
  })
  .prefix('/api/stats')
