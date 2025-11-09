import { Student } from './Student';

export class StudentSet {
  private students: Student[] = [];

  constructor() {
    // StudentSet is now independent of persistence
  }

  // Add a new student
  addStudent(student: Student): Student {
    // Check if CPF already exists (student.cpf is already clean)
    if (this.findStudentByCPF(student.cpf)) {
      throw new Error('Student with this CPF already exists');
    }

    this.students.push(student);
    return student;
  }

  // Remove student by CPF (expects clean CPF)
  removeStudent(cpf: string): boolean {
    const index = this.students.findIndex(s => s.cpf === cpf);
    
    if (index === -1) {
      return false;
    }

    this.students.splice(index, 1);
    return true;
  }

  // Update student by CPF
  updateStudent(updatedStudent: Student): Student {
    // updatedStudent.cpf is already clean
    const existingStudent = this.findStudentByCPF(updatedStudent.cpf);
    
    if (!existingStudent) {
      throw new Error('Student not found');
    }

    // Update basic fields
    existingStudent.name = updatedStudent.name;
    existingStudent.email = updatedStudent.email;
    
        // Update evaluations by modifying existing objects and adding new ones as needed
    updatedStudent.evaluations.forEach(updatedEval => {
      // Find existing evaluation for this goal
      const existingEval = existingStudent.evaluations.find(evaluation => evaluation.getGoal() === updatedEval.getGoal());
      
      if (existingEval) {
        // Update the existing evaluation object's grade (preserving object identity)
        existingEval.setGrade(updatedEval.getGrade());
      } else {
        // Add new evaluation object for goals that don't exist yet
        existingStudent.evaluations.push(updatedEval);
      }
    });
    
    // Remove evaluations that are no longer in the updated list
    for (let i = existingStudent.evaluations.length - 1; i >= 0; i--) {
      const existingGoal = existingStudent.evaluations[i].getGoal();
      const stillExists = updatedStudent.evaluations.some(updatedEval => updatedEval.getGoal() === existingGoal);
      
      if (!stillExists) {
        existingStudent.evaluations.splice(i, 1);
      }
    }
    
    // CPF should not be updated as it's the identifier
    
    return existingStudent;
  }

  // Find student by CPF (expects clean CPF)
  findStudentByCPF(cpf: string): Student | undefined {
    return this.students.find(s => s.cpf === cpf);
  }

  // Get all students
  getAllStudents(): Student[] {
    return [...this.students]; // Return a copy to prevent external modification
  }

  // Get students count
  getCount(): number {
    return this.students.length;
  }
}