import logger from '@adonisjs/core/services/logger'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'
class WsService {
  io: Server | undefined
  private booted = false

  boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }
    logger.info('Booting WebSocket service...')

    this.booted = true
    this.io = new Server(server.getNodeServer(), {
      cors: {
        origin: '*',
      },
    })
  }
}

export default new WsService()
