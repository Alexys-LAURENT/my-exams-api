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
const ClassesController = () => import('../controllers/classes_controller/controller.js')
const DegreesController = () => import('../controllers/degrees_controller/controller.js')
const StudentsController = () => import('../controllers/students_controller/controller.js')
const ExamsController = () => import('../controllers/exams_controller/controller.js')
const AuthController = () => import('../controllers/auth_controller/controller.js')
const AnswersController = () => import('../controllers/answers_controller/controller.js')
const QuestionsController = () => import('../controllers/questions_controller/controller.js')
const TeachersController = () => import('../controllers/teachers_controller/controller.js')

/*
 █████  ██    ██ ████████ ██   ██ 
██   ██ ██    ██    ██    ██   ██ 
███████ ██    ██    ██    ███████ 
██   ██ ██    ██    ██    ██   ██ 
██   ██  ██████     ██    ██   ██ 
*/

router
  .group(() => {
    router.post('/login', [AuthController, 'login'])
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
  })
  .prefix('/api/auth')

router
  .group(() => {
    router.get(':idClass', [ClassesController, 'getOneClass'])
    router.delete('/:idClass', [ClassesController, 'deleteIdClass']).use(middleware.auth())
    router.get('/:idClasse/degrees', [DegreesController, 'getPromosOfClass'])
    router.get('/:idClass/students', [StudentsController, 'getStudentsOfClass'])
  })
  .prefix('/api/classes')

router
  .group(() => {
    router.post('/', [StudentsController, 'createStudent'])
    router.get('/:idStudent/classes', [ClassesController, 'getStudentClasses'])
    router.get('/:idStudent/exams/:idExam/status', [ExamsController, 'getExamGradeForOneStudent'])
  })
  .prefix('/api/students')

router
  .group(() => {
    router.get('/', [TeachersController, 'getAll'])
    router.get(':idTeacher', [TeachersController, 'getOneTeacher'])
    router.post('/', [TeachersController, 'createTeacher'])
    router.get('/:idTeacher/exams', [ExamsController, 'getAllExamsForOneTeacher'])
    router.delete('/:idTeacher', [TeachersController, 'deleteTeacher'])
    router.put('/:idTeacher', [TeachersController, 'updateTeacher'])
    router.get(':idTeacher/classes', [ClassesController, 'getAllClassesForOneTeacher'])
  })
  .prefix('/api/teachers')

router
  .group(() => {
    router.get('/:idExam/questions/count', [QuestionsController, 'getQuestionsCountForOneExam'])
    router.get(':idExam', [ExamsController, 'getOneExam'])
    router.get('/:idExam/questions/:idQuestion', [
      QuestionsController,
      'getQuestionsByIdForOneExam',
    ])
    router.get('/:idExam/questions/:idQuestion/answers', [
      AnswersController,
      'getAnswersByQuestionsForExam',
    ])
    router.post('/:idExam/start', [ExamsController, 'startExam']).use(middleware.auth())
    router.post('/', [ExamsController, 'createExam'])
    router.post('/:idExam/questions', [QuestionsController, 'createQuestion'])
    router.post('/:idExam/questions/:idQuestion/answers', [AnswersController, 'createAnswers'])
  })
  .prefix('/api/exams')
