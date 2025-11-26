import Class from '#models/class'
import ExamGrade from '#models/exam_grade'
import Matiere from '#models/matiere'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
export default class StatsService {
  async getUserGeneralAverageInClass(idUser: number, idClass: number) {
    const allSubjects = await this.getAllSubjectsInClass(idClass)

    if (allSubjects.length === 0) {
      return 0
    }

    let totalAverage = 0
    let notableSubjectsCount = 0
    for (const subject of allSubjects) {
      const subjectAverage = await this.getUserSubjectAverageInClass(
        idUser,
        idClass,
        subject.idMatiere
      )
      if (subjectAverage !== null) {
        totalAverage += subjectAverage
        notableSubjectsCount++
      }
    }

    if (notableSubjectsCount === 0) {
      return 0
    }
    return totalAverage / notableSubjectsCount
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

  async getAllSubjectsInClass(idClass: number) {
    // Récupérer tous les professeurs de cette classe
    const teachers = await User.query()
      .where('accountType', 'teacher')
      .whereHas('teacherClasses', (query) => {
        query.where('teachers_classes.id_class', idClass)
      })
      .preload('matieres')

    if (!teachers || teachers.length === 0) {
      return []
    }

    // Récupérer toutes les matières associées à ces professeurs
    const subjectsSet = [] as Matiere[]
    teachers.forEach((teacher) => {
      teacher.matieres.forEach((matiere) => {
        if (!subjectsSet.find((m) => m.idMatiere === matiere.idMatiere)) {
          subjectsSet.push(matiere)
        }
      })
    })

    return subjectsSet
  }

  async getUserSubjectAverageInClass(idUser: number, idClass: number, idMatiere: number) {
    // Récupérer tous les examens associés à cette classe et cette matière
    const examsOfClassAndSubject = await db
      .from('exams_classes')
      .join('exams', 'exams.id_exam', 'exams_classes.id_exam')
      .select('exams.id_exam')
      .where('exams_classes.id_class', idClass)
      .andWhere('exams.id_matiere', idMatiere)
      .where('exams_classes.end_date', '<', new Date())
    const examIds = examsOfClassAndSubject.map((e) => e.id_exam)

    // We return null if there are no exams for this subject in this class
    if (examIds.length === 0) {
      return null
    }
    // Récupérer les notes de l'utilisateur pour ces examens
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
    const average = totalExamGrades / examIds.length

    return average
  }
}
