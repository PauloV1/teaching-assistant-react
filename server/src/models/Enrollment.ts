import { Student } from './Student';
import { Evaluation, Grade } from './Evaluation';

export class Enrollment {
  private student: Student;
  private evaluations: Evaluation[];
  private selfEvaluations: Evaluation[];
  // Média do estudante antes da prova final
  private mediaPreFinal: number;
  // Média do estudante depois da final
  private mediaPosFinal: number;
  private reprovadoPorFalta: Boolean;

  constructor(student: Student, evaluations: Evaluation[] = [], selfEvaluations: Evaluation[] = [], mediaPreFinal: number = 0, mediaPosFinal: number = 0, reprovadoPorFalta: Boolean = false) {
    this.student = student;
    this.evaluations = evaluations;
    this.selfEvaluations = selfEvaluations;
    this.mediaPreFinal = mediaPreFinal;
    this.mediaPosFinal = mediaPosFinal;
    this.reprovadoPorFalta = reprovadoPorFalta;
  }

  // Get student
  getStudent(): Student {
    return this.student;
  }

  // Get media do estudante antes da prova final
  getMediaPreFinal(): number{
    return this.mediaPreFinal;
  }

  // Set media do estudante antes da prova final
  setMediaPreFinal(mediaPreFinal: number){
    this.mediaPreFinal = mediaPreFinal;
  }

  // Get média do estudante depois da final
  getMediaPosFinal(): number{
    return this.mediaPosFinal;
  }

  // Set média do estudante depois da final
  setMediaPosFinal(mediaPosFinal: number){
    this.mediaPosFinal = mediaPosFinal;
  }

  // Get reprovado por falta 
  getReprovadoPorFalta(): Boolean {
    return this.reprovadoPorFalta;
  }
  
  // Set reprovado por falta
  setReprovadoPorFalta(reprovadoPorFalta: Boolean){
    this.reprovadoPorFalta = reprovadoPorFalta;
  }

  private clone(list: Evaluation[]): Evaluation[] {
    return [...list];
  }

  // Add or update an evaluation
  private addOrUpdateIn(list: Evaluation[], goal: string, grade: Grade): void {
    const existingIndex = list.findIndex(evaluation => evaluation.getGoal() === goal);
    if (existingIndex >= 0) {
      list[existingIndex].setGrade(grade);
    } else {
      list.push(new Evaluation(goal, grade));
    }
  }

  // Remove an evaluation
  private removeFrom(list: Evaluation[], goal: string): boolean {
    const existingIndex = list.findIndex(evaluation => evaluation.getGoal() === goal);
    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      return true;
    }
    return false;
  }

  private findIn(list: Evaluation[], goal: string): Evaluation | undefined {
    return list.find(evaluation => evaluation.getGoal() === goal);
  }

  getEvaluations(): Evaluation[] {
    return this.clone(this.evaluations); // Return copy to prevent external modification
  }

  getSelfEvaluations(): Evaluation[] {
    return this.clone(this.selfEvaluations); // Return copy to prevent external modification
  }

  // Add or update an evaluation
  addOrUpdateEvaluation(goal: string, grade: Grade): void {
    this.addOrUpdateIn(this.evaluations, goal, grade);
  }
  
  // Add or update a self-evaluation
  addOrUpdateSelfEvaluation(goal: string, grade: Grade): void {
    this.addOrUpdateIn(this.selfEvaluations, goal, grade);
  }

  // Remove an evaluation
  removeEvaluation(goal: string): boolean {
    return this.removeFrom(this.evaluations, goal);
  }

  // Remove a self-evaluation
  removeSelfEvaluation(goal: string): boolean {
    return this.removeFrom(this.selfEvaluations, goal);
  }
  
  // Get evaluation for a specific goal
  getEvaluationForGoal(goal: string): Evaluation | undefined {
    return this.findIn(this.evaluations, goal);
  }

  // Get self-evaluation for a specific goal
  getSelfEvaluationForGoal(goal: string): Evaluation | undefined {
    return this.findIn(this.selfEvaluations, goal);
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      student: this.student.toJSON(),
      evaluations: this.evaluations.map(evaluation => evaluation.toJSON()),
      selfEvaluations: this.selfEvaluations.map(selfEvaluation => selfEvaluation.toJSON())
    };
  }

  // Create Enrollment from JSON object
  static fromJSON(data: { student: any; evaluations: any[]; selfEvaluations: any[] }, student: Student): Enrollment {
    const evaluations = data.evaluations
      ? data.evaluations.map((evalData: any) => Evaluation.fromJSON(evalData))
      : [];
    const selfEvaluations = data.selfEvaluations
      ? data.selfEvaluations.map((evalData: any) => Evaluation.fromJSON(evalData))
      : [];
    return new Enrollment(student, evaluations, selfEvaluations);
  }
}
