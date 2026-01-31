import UnauthorizedException from '#exceptions/un_authorized_exception'
import Exam from '#models/exam'
import { DateTime } from 'luxon'

/**
 * Service for exam authorization checks.
 * Stateless service that can be injected with @inject.
 */
export default class ExamAuthorizationService {
  /**
   * Vérifie si un examen peut être modifié (questions, réponses, métadonnées)
   * Conditions : l'utilisateur doit être le propriétaire ET aucune classe ne doit avoir commencé
   * @param idExam - L'identifiant de l'examen
   * @param userId - L'identifiant de l'utilisateur qui veut modifier
   * @returns L'examen si modifiable
   * @throws UnauthorizedException si non modifiable
   */
  async checkExamModifiable(idExam: number, userId: number): Promise<Exam> {
    const exam = await Exam.findOrFail(idExam)

    // Vérifier que l'utilisateur est propriétaire de l'examen
    if (exam.idTeacher !== userId) {
      throw new UnauthorizedException('Vous ne pouvez modifier que vos propres examens')
    }

    // Vérifier qu'aucune classe n'a commencé
    const examClasses = await exam
      .related('classes')
      .query()
      .pivotColumns(['start_date', 'end_date'])
    const now = DateTime.now()
    const hasStarted = examClasses.some((ec) => {
      const startDate = ec.$extras.pivot_start_date
      return startDate && DateTime.fromJSDate(startDate) <= now
    })

    if (hasStarted) {
      throw new UnauthorizedException(
        'Cet examen ne peut plus être modifié car au moins une classe a déjà commencé'
      )
    }

    return exam
  }
}
