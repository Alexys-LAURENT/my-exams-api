import User from '#models/user'
import factory from '@adonisjs/lucid/factories'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      // about: faker.lorem.paragraph(),
      // acceptNewMessageFrom: faker.helpers.arrayElement(['all', 'nobody', 'following']),
      // accountType: 'student',
      // alias: faker.internet.username(),
      // darkMode: faker.datatype.boolean(),
      // email: faker.internet.email(),
      // isEmailVerified: true,
      // isOnboardingCompleted: true,
      // language: 'fr-FR' as 'fr-FR' | 'en-US' | 'en-GB' | 'es-ES',
      // password: 'Secret123',
      // username: faker.internet.username(),
      // website: faker.internet.url(),
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
