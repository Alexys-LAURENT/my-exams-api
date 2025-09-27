import { UserFactory } from '#database/factories/user_factory'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class InsertDevDataSeeder extends BaseSeeder {
  static environment = ['development']
  async run() {
    await UserFactory.merge({
      email: 'john@doe.com',
      password: 'Secret123',
      name: 'John',
      lastName: 'Doe',
      accountType: 'student',
    }).create()

    await UserFactory.merge({
      email: 'teacher@school.com',
      password: 'Secret123',
      name: 'Jane',
      lastName: 'Smith',
      accountType: 'teacher',
    }).create()

    await UserFactory.merge({
      email: 'admin@school.com',
      password: 'Secret123',
      name: 'Admin',
      lastName: 'User',
      accountType: 'admin',
    }).create()
  }
}
