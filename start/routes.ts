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
const StudentsController = () => import('../controllers/students_controller/controller.js')
const AuthController = () => import('../controllers/auth_controller/controller.js')

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
    router.get('/', [ClassesController, 'getAll'])
    router.get(':idClass', [ClassesController, 'getOneClass'])
    router.get('/:idClass/students', [StudentsController, 'getStudentsOfClass'])
    router.delete(':idClass/students/:idStudent', [StudentsController, 'deleteStudentFromClass']).use(middleware.auth())
  })
  .prefix('/api/classes')
