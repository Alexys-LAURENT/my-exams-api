/* eslint-disable @unicorn/filename-case */
import { Socket } from 'socket.io'

export default (socket: Socket) => {
  socket.on('start_exam', (data: { idUser: number; idExam: number }) => {
    socket.join(`exam-session-user-${data.idUser.toString()}-exam-${data.idExam.toString()}`)
  })
  socket.on('stop_exam', (data: { idUser: number; idExam: number }) => {
    socket.leave(`exam-session-user-${data.idUser.toString()}-exam-${data.idExam.toString()}`)
  })

  // Liste d'autres listeners ici
}
