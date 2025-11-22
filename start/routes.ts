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
    router.post('/login', [AuthController, 'login'])
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
  })
  .prefix('/api/auth')

router
  .group(() => {
    router.get('/', [ClassesController, 'getAll']).use(middleware.auth())
    router.post('/', [ClassesController, 'createClass']).use(middleware.auth())
    router.put('/:idClass', [ClassesController, 'updateClass']).use(middleware.auth())
    router.get(':idClass', [ClassesController, 'getOneClass'])
    router.delete('/:idClass', [ClassesController, 'deleteIdClass']).use(middleware.auth())
    router.get('/:idClasse/degrees', [DegreesController, 'getPromosOfClass'])
    router.get('/:idClass/students', [StudentsController, 'getStudentsOfClass'])
    router
      .put(':idClass/students/:idStudent', [StudentsController, 'putStudentToClass'])
      .use(middleware.auth())
    router
      .delete(':idClass/students/:idStudent', [StudentsController, 'deleteStudentFromClass'])
      .use(middleware.auth())
    router
      .delete(':idClass/exams/:idExam', [ExamsController, 'deleteExamFromClass'])
      .use(middleware.auth())
    router
      .put(':idClass/teachers/:idTeacher', [TeachersController, 'putTeacherToClass'])
      .use(middleware.auth())
    router
      .delete(':idClass/teachers/:idTeacher', [TeachersController, 'removeTeacherFromClass'])
      .use(middleware.auth())
    router
      .put(':idClass/exams/:idExam', [ExamsController, 'putExamsForClass'])
      .use(middleware.auth())
    router.get(':idClass/exams', [ExamsController, 'getAllExamsOfClass']).use(middleware.auth())
    router
      .get(':idClass/students/:idStudent/exams/:status', [
        ExamsController,
        'getExamsByTypeOfStudentInClass',
      ])
      .use(middleware.auth())
    router
      .get(':idClass/students/:idStudent/exams/:status/count', [
        ExamsController,
        'getCountExamsByTypeOfStudentInClass',
      ])
      .use(middleware.auth())
    router.get(':idClass/students/:idStudent/exams/:idExam/exam_grades', [
      ExamGradesController,
      'getExamGradeForOneStudent',
    ])
    router
      .post(':idClass/students/:idStudent/exams/:idExam/start', [ExamsController, 'startExam'])
      .use(middleware.auth())
    router
      .post(':idClass/students/:idStudent/exams/:idExam/stop', [ExamsController, 'stopExam'])
      .use(middleware.auth())
    router
      .post(':idClass/students/:idStudent/exams/:idExam/retake', [ExamsController, 'reTakeExam'])
      .use(middleware.auth())
    router
      .get(':idClass/students/:idStudent/exams/:idExam/recap', [ExamsController, 'recap'])
      .use(middleware.auth())
    router.get('exams/:idExam', [ClassesController, 'getClassesForOneExam'])
  })
  .prefix('/api/classes')

router
  .group(() => {
    router.post('/', [StudentsController, 'createStudent'])
    router.delete('/:idStudent', [StudentsController, 'deleteStudent'])
    router.put('/:idStudent', [StudentsController, 'updateStudent'])
    router.get('/:idStudent/classes', [ClassesController, 'getStudentClasses'])
    router.get('/', [StudentsController, 'getAll'])
    router.get('/:idStudent', [StudentsController, 'getOneStudent'])
  })
  .prefix('/api/students')

router
  .group(() => {
    router.get('/', [TeachersController, 'getAll'])
    router.get(':idTeacher', [TeachersController, 'getOneTeacher'])
    router.post('/', [TeachersController, 'createTeacher'])
    router.get('/:idTeacher/exams/active', [TeachersController, 'getActiveExamsForOneTeacher'])
    router.get('/:idTeacher/exams', [ExamsController, 'getAllExamsForOneTeacher'])
    router.delete('/:idTeacher', [TeachersController, 'deleteTeacher'])
    router.put('/:idTeacher', [TeachersController, 'updateTeacher'])
    router.get(':idTeacher/classes', [ClassesController, 'getAllClassesForOneTeacher'])
    router.get('/:idTeacher/matieres', [TeachersController, 'getMatieres'])
  })
  .prefix('/api/teachers')

router
  .group(() => {
    router.get('/:idExam/questions/count', [QuestionsController, 'getQuestionsCountForOneExam'])
    router.get(':idExam', [ExamsController, 'getOneExam'])
    router.put(':idExam', [ExamsController, 'updateExam'])
    router.post('/', [ExamsController, 'createExam'])
    router.post('/:idExam/questions', [QuestionsController, 'createQuestion'])
    router.post('/:idExam/questions/:idQuestion/answers', [AnswersController, 'createAnswers'])
    router.get('/:idExam/questions', [QuestionsController, 'getAllQuestionsForOneExam'])
    router.get(':idExam/classes', [ExamsController, 'getExamClasses'])
    router.get('/:idExam/questions/:idQuestion/answers', [
      AnswersController,
      'getAllAnswersForOneQuestionOfOneExam',
    ])
  })
  .prefix('/api/exams')

router
  .group(() => {
    router.get('/', [DegreesController, 'getAll']).use(middleware.auth())
    router.delete('/:idDegree', [DegreesController, 'deleteDegree']).use(middleware.auth())
    router.post('/', [DegreesController, 'createDegree']).use(middleware.auth())
    router.put('/:idDegree', [DegreesController, 'updateDegree']).use(middleware.auth())
  })
  .prefix('/api/degrees')

router
  .group(() => {
    router.post('/', [UsersResponsesController, 'createUsersResponse'])
    router.put('/:idUserResponse', [UsersResponsesController, 'updateUsersResponse'])
  })
  .prefix('/api/users_responses')

router
  .group(() => {
    router.put('/:idExamGrade', [ExamGradesController, 'updateExamGrade']).use(middleware.auth())
    router
      .get('/classes/:idClass/student/:idStudent', [
        ExamGradesController,
        'getExamGradesForStudentInOneClass',
      ])
      .use(middleware.auth())
  })
  .prefix('/api/exam_grades')

router
  .group(() => {
    router.post('/', [EvaluationsController, 'createEvaluation']).use(middleware.auth())
    router.put('/:idEvaluation', [EvaluationsController, 'updateEvaluation']).use(middleware.auth())
  })
  .prefix('/api/evaluations')

router
  .group(() => {
    router
      .get('/exams/:idExam/classes/:idClass', [ExamsClassesController, 'getExamClassRelation'])
      .use(middleware.auth())
  })
  .prefix('/api/exams_classes')

router
  .group(() => {
    router.get('/', [MatieresController, 'getAll'])
    router.get('/:idMatiere', [MatieresController, 'getMatiereFromId'])
    router.post('/', [MatieresController, 'createMatiere']).use(middleware.auth())
    router.put('/:idMatiere', [MatieresController, 'updateMatiere']).use(middleware.auth())
    router.delete('/:idMatiere', [MatieresController, 'deleteMatiere']).use(middleware.auth())
    router.get('/:idMatiere/teachers', [MatieresController, 'getTeachers'])
    router
      .put('/:idMatiere/teachers/:idTeacher', [MatieresController, 'addTeacherToMatiere'])
      .use(middleware.auth())
    router
      .delete('/:idMatiere/teachers/:idTeacher', [MatieresController, 'removeTeacherFromMatiere'])
      .use(middleware.auth())
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
    // Moyenne générale d'un élève dans une classe
    router
      .get('/classes/:idClass/users/:idUser/average', [
        StatsController,
        'getUserGeneraleAverageInClass',
      ])
      .use(middleware.auth())

    // Taux de participation moyen des élèves aux examens d'un prof pour une classe
    router
      .get('/teachers/:idTeacher/classes/:idClass/average_participation_rate', [
        StatsController,
        'getAverageParticipationRate',
      ])
      .use(middleware.auth())

    // Moyenne de la classe pour un examen spécifique
    router
      .get('/exams/:idExam/classes/:idClass/average', [StatsController, 'getClassAverageForExam'])
      .use(middleware.auth())

    // Top 5 des questions les plus échouées d'un examen
    router
      .get('/exams/:idExam/most_failed_questions', [StatsController, 'getMostFailedQuestions'])
      .use(middleware.auth())

    // Moyenne générale d'une classe (tous examens confondus)
    router
      .get('/classes/:idClass/average', [StatsController, 'getClassGeneralAverage'])
      .use(middleware.auth())
  })
  .prefix('/api/stats')
