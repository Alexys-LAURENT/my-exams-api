import User from '#models/user'
import factory from '@adonisjs/lucid/factories'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      lastName: faker.person.lastName(),
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: 'Secret123',
      accountType: faker.helpers.arrayElement(['student', 'teacher', 'admin']) as
        | 'student'
        | 'teacher'
        | 'admin',
    }
  })
  .build()
