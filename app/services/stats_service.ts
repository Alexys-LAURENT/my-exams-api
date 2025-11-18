import Class from '#models/class'
import ExamGrade from '#models/exam_grade'
import db from '@adonisjs/lucid/services/db'
export default class StatsService {
  async getUserGeneralAverageInClass(idUser: number, idClass: number) {
    // Récupérer tous les examens associés à cette classe
    const examsOfClass = await db
      .from('exams_classes')
      .select('id_exam')
      .where('id_class', idClass)
      .where('end_date', '<', new Date())

    const examIds = examsOfClass.map((e) => e.id_exam)

    if (examIds.length === 0) {
      return 0
    }

    // Récupérer les notes de l'utilisateur pour ces examens
    // On exclut les examens 'en cours' et ceux sans note
    const examGrades = await ExamGrade.query()
      .where('id_user', idUser)
      .andWhere('id_class', idClass)
      .whereIn('id_exam', examIds)
      .andWhere('status', 'corrigé')
      .whereNotNull('note')

    if (examGrades.length === 0) {
      return 0
    }

    // Calcul de la moyenne : somme des notes / nombre de notes
    const totalExamGrades = examGrades
      .map((eg) => Number.parseFloat(eg.note as unknown as string) || 0)
      .reduce((a, b) => a + b, 0)

    const average = totalExamGrades / examsOfClass.length

    return average
  }

  async getGeneralAverageForClass(idClass: number) {
    // Vérifier que la classe existe
    await Class.findOrFail(idClass)

    // Récupérer tous les élèves de cette classe
    const students = await db
      .from('students_classes')
      .where('id_class', idClass)
      .select('id_student')
    const studentIds = students.map((s) => s.id_student)

    if (studentIds.length === 0) {
      return 0
    }
    // Récupérer les moyennes générales de chaque élève
    let totalAverage = 0
    for (const studentId of studentIds) {
      const average = await this.getUserGeneralAverageInClass(studentId, idClass)
      totalAverage += average
    }
    return totalAverage / studentIds.length
  }

  async getGeneralAverageForClassAndForOneExam(idClass: number, idExam: number) {
    // Vérifier que la classe existe
    await Class.findOrFail(idClass)

    // Récupérer tous les élèves de cette classe
    const students = await db
      .from('students_classes')
      .where('id_class', idClass)
      .select('id_student')
    const studentIds = students.map((s) => s.id_student)

    if (studentIds.length === 0) {
      return 0
    }
    // Récupérer la note pour chaque élève
    let totalGrade = 0
    for (const studentId of studentIds) {
      const examGrade = await ExamGrade.query()
        .where('id_user', studentId)
        .andWhere('id_class', idClass)
        .andWhere('id_exam', idExam)
        .first()
      if (examGrade && examGrade.note !== null) {
        totalGrade += Number.parseFloat(examGrade.note as unknown as string) || 0
      }
    }

    return (totalGrade / studentIds.length).toFixed(2)
  }
}
