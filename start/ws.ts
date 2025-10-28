import WsService from '#services/ws_service'
import app from '@adonisjs/core/services/app'
import socketHandlers from '../app/sockets/socketHandlers.js'

app.ready(() => {
  WsService.boot()
  const io = WsService.io
  io?.on('connection', (socket) => {
    console.log('New client connected:', socket.id)
    socketHandlers(socket)
  })
})
