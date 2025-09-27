import { DateTime } from 'luxon'

export default class DateTimeService {
  /**
   * Format a DateTime object to a string based on the user's language preference
   * @param date The DateTime object to format
   * @param language The user's language preference (e.g., 'fr-FR', 'en-US', 'en-GB', 'es-ES') default is 'fr-FR'
   * @returns A formatted date string
   */
  formatDateByLanguage(date: DateTime, language: string = 'fr-FR'): string {
    const formats = {
      'fr-FR': 'dd/MM/yyyy HH:mm',
      'en-US': 'MM/dd/yyyy hh:mm a',
      'en-GB': 'dd/MM/yyyy hh:mm a',
      'es-ES': 'dd/MM/yyyy HH:mm',
    }

    const format = formats[language as keyof typeof formats] || 'dd/MM/yyyy HH:mm'
    return date.setZone('Europe/Paris').toFormat(format)
  }
}
