import User from '#models/user'

export default class UsersRepository {
  async findOrFailUserByEmail(email: string) {
    const user = await User.query().where('email', email).firstOrFail()

    return user
  }
}
