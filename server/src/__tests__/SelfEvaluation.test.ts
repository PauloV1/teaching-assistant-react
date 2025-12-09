import request from 'supertest';
import { app, studentSet, classes } from '../server';
import { Student } from '../models/Student';
import { Class } from '../models/Class';
import { DEFAULT_ESPECIFICACAO_DO_CALCULO_DA_MEDIA } from '../models/EspecificacaoDoCalculoDaMedia';

describe('Server API - Self-Evaluation Endpoints', () => {
  let testStudent: Student;
  let testClass: Class;

  // Clean up and setup before each test
  beforeEach(() => {
    // Clear all students and classes
    const allStudents = studentSet.getAllStudents();
    allStudents.forEach(student => {
      try {
        studentSet.removeStudent(student.getCPF());
      } catch (error) {
        // Student might not exist
      }
    });

    const allClasses = classes.getAllClasses();
    allClasses.forEach(classObj => {
      try {
        classes.removeClass(classObj.getClassId());
      } catch (error) {
        // Class might not exist
      }
    });

    // Create test student
    testStudent = new Student('João Silva', '123.456.789-01', 'joao@email.com');
    studentSet.addStudent(testStudent);

    // Create test class
    testClass = new Class('Software Engineering', 1, 2025, DEFAULT_ESPECIFICACAO_DO_CALCULO_DA_MEDIA);
    classes.addClass(testClass);

    // Enroll student in class
    testClass.addEnrollment(testStudent);
  });

  describe('PUT /api/classes/:classId/enrollments/:studentCPF/selfEvaluation', () => {
    describe('Valid self-evaluation submissions', () => {
      test('should add MA self-evaluation for a goal', async () => {
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: 'MA'
          })
          .expect(200);

        expect(response.body.selfEvaluations).toContainEqual({
          goal: 'Requirements',
          grade: 'MA'
        });
      });

      test('should add MPA self-evaluation for a goal', async () => {
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Configuration Management',
            grade: 'MPA'
          })
          .expect(200);

        expect(response.body.selfEvaluations).toContainEqual({
          goal: 'Configuration Management',
          grade: 'MPA'
        });
      });

      test('should add MANA self-evaluation for a goal', async () => {
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Project Management',
            grade: 'MANA'
          })
          .expect(200);

        expect(response.body.selfEvaluations).toContainEqual({
          goal: 'Project Management',
          grade: 'MANA'
        });
      });

      test('should accept CPF with formatting (dots and hyphens)', async () => {
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/123.456.789-01/selfEvaluation`)
          .send({
            goal: 'Design',
            grade: 'MA'
          })
          .expect(200);

        expect(response.body.selfEvaluations).toContainEqual({
          goal: 'Design',
          grade: 'MA'
        });
      });

      test('should accept CPF without formatting', async () => {
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/12345678901/selfEvaluation`)
          .send({
            goal: 'Tests',
            grade: 'MPA'
          })
          .expect(200);

        expect(response.body.selfEvaluations).toContainEqual({
          goal: 'Tests',
          grade: 'MPA'
        });
      });

      test('should allow multiple self-evaluations for different goals', async () => {
        // Add first evaluation
        await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: 'MA'
          })
          .expect(200);

        // Add second evaluation
        await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Configuration Management',
            grade: 'MPA'
          })
          .expect(200);

        // Add third evaluation
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Design',
            grade: 'MA'
          })
          .expect(200);

        expect(response.body.selfEvaluations).toHaveLength(3);
        expect(response.body.selfEvaluations).toEqual(
          expect.arrayContaining([
            { goal: 'Requirements', grade: 'MA' },
            { goal: 'Configuration Management', grade: 'MPA' },
            { goal: 'Design', grade: 'MA' }
          ])
        );
      });
    });

    describe('Update existing self-evaluations', () => {
      test('should update existing self-evaluation from MA to MPA', async () => {
        // Create initial evaluation
        await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: 'MA'
          })
          .expect(200);

        // Update the same goal
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: 'MPA'
          })
          .expect(200);

        expect(response.body.selfEvaluations).toContainEqual({
          goal: 'Requirements',
          grade: 'MPA'
        });

        // Should have only one evaluation for Requirements
        const requirementsEvals = response.body.selfEvaluations.filter(
          (e: any) => e.goal === 'Requirements'
        );
        expect(requirementsEvals).toHaveLength(1);
      });

      test('should update existing self-evaluation from MPA to MANA', async () => {
        await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Design',
            grade: 'MPA'
          })
          .expect(200);

        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Design',
            grade: 'MANA'
          })
          .expect(200);

        expect(response.body.selfEvaluations).toContainEqual({
          goal: 'Design',
          grade: 'MANA'
        });
      });

      test('should update existing self-evaluation from MANA to MA', async () => {
        await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Tests',
            grade: 'MANA'
          })
          .expect(200);

        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Tests',
            grade: 'MA'
          })
          .expect(200);

        expect(response.body.selfEvaluations).toContainEqual({
          goal: 'Tests',
          grade: 'MA'
        });
      });
    });

    describe('Remove self-evaluations', () => {
      test('should remove self-evaluation when grade is empty string', async () => {
        // Add evaluation
        await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: 'MA'
          })
          .expect(200);

        // Remove by sending empty grade
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: ''
          })
          .expect(200);

        expect(response.body.selfEvaluations).not.toContainEqual(
          expect.objectContaining({ goal: 'Requirements' })
        );
      });

      test('should remove self-evaluation when grade is null', async () => {
        await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Design',
            grade: 'MPA'
          })
          .expect(200);

        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Design',
            grade: null
          })
          .expect(200);

        expect(response.body.selfEvaluations).not.toContainEqual(
          expect.objectContaining({ goal: 'Design' })
        );
      });

      test('should remove self-evaluation when grade is undefined', async () => {
        await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Tests',
            grade: 'MA'
          })
          .expect(200);

        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Tests',
            grade: undefined
          })
          .expect(200);

        expect(response.body.selfEvaluations).not.toContainEqual(
          expect.objectContaining({ goal: 'Tests' })
        );
      });
    });

    describe('Invalid self-evaluation requests', () => {
      test('should reject invalid grade (not MA, MPA, or MANA)', async () => {
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: 'INVALID'
          })
          .expect(400);

        expect(response.body.error).toContain('Invalid grade');
      });

      test('should reject numeric grade', async () => {
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: '10'
          })
          .expect(400);

        expect(response.body.error).toContain('Invalid grade');
      });

      test('should reject lowercase grade', async () => {
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: 'ma'
          })
          .expect(400);

        expect(response.body.error).toContain('Invalid grade');
      });

      test('should reject request without goal', async () => {
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            grade: 'MA'
          })
          .expect(400);

        expect(response.body.error).toContain('Goal is required');
      });

      test('should reject request with empty goal', async () => {
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: '',
            grade: 'MA'
          })
          .expect(400);

        expect(response.body.error).toContain('Goal is required');
      });

      test('should return 404 for non-existent class', async () => {
        const response = await request(app)
          .put(`/api/classes/non-existent-class-id/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: 'MA'
          })
          .expect(404);

        expect(response.body.error).toBe('Class not found');
      });

      test('should return 404 for non-enrolled student', async () => {
        // Create a student that is not enrolled
        const unenrolledStudent = new Student('Maria Santos', '987.654.321-00', 'maria@email.com');
        studentSet.addStudent(unenrolledStudent);

        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${unenrolledStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: 'MA'
          })
          .expect(404);

        expect(response.body.error).toBe('Student not enrolled in this class');
      });

      test('should return 404 for non-existent student', async () => {
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/999.999.999-99/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: 'MA'
          })
          .expect(404);

        expect(response.body.error).toBe('Student not enrolled in this class');
      });
    });

    describe('Self-evaluation independence from regular evaluations', () => {
      test('should allow self-evaluation and regular evaluation for same goal', async () => {
        // Add regular evaluation
        await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/evaluation`)
          .send({
            goal: 'Requirements',
            grade: 'MPA'
          })
          .expect(200);

        // Add self-evaluation for same goal
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: 'MA'
          })
          .expect(200);

        // Both should exist independently
        expect(response.body.evaluations).toContainEqual({
          goal: 'Requirements',
          grade: 'MPA'
        });
        expect(response.body.selfEvaluations).toContainEqual({
          goal: 'Requirements',
          grade: 'MA'
        });
      });

      test('should not affect regular evaluations when updating self-evaluation', async () => {
        // Add regular evaluation
        await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/evaluation`)
          .send({
            goal: 'Design',
            grade: 'MA'
          })
          .expect(200);

        // Update self-evaluation
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Design',
            grade: 'MANA'
          })
          .expect(200);

        // Regular evaluation should remain unchanged
        expect(response.body.evaluations).toContainEqual({
          goal: 'Design',
          grade: 'MA'
        });
        expect(response.body.selfEvaluations).toContainEqual({
          goal: 'Design',
          grade: 'MANA'
        });
      });

      test('should not affect self-evaluations when updating regular evaluation', async () => {
        // Add self-evaluation
        await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Tests',
            grade: 'MA'
          })
          .expect(200);

        // Update regular evaluation
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/evaluation`)
          .send({
            goal: 'Tests',
            grade: 'MPA'
          })
          .expect(200);

        // Self-evaluation should remain unchanged
        expect(response.body.selfEvaluations).toContainEqual({
          goal: 'Tests',
          grade: 'MA'
        });
        expect(response.body.evaluations).toContainEqual({
          goal: 'Tests',
          grade: 'MPA'
        });
      });
    });

    describe('Multiple students in same class', () => {
      test('should maintain separate self-evaluations for different students', async () => {
        // Create second student and enroll
        const student2 = new Student('Maria Santos', '987.654.321-00', 'maria@email.com');
        studentSet.addStudent(student2);
        testClass.addEnrollment(student2);

        // Add evaluation for first student
        await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: 'MA'
          })
          .expect(200);

        // Add different evaluation for second student
        const response = await request(app)
          .put(`/api/classes/${testClass.getClassId()}/enrollments/${student2.getCPF()}/selfEvaluation`)
          .send({
            goal: 'Requirements',
            grade: 'MANA'
          })
          .expect(200);

        expect(response.body.selfEvaluations).toContainEqual({
          goal: 'Requirements',
          grade: 'MANA'
        });

        // Verify first student's evaluation is unchanged
        const enrollments = testClass.getEnrollments();
        const student1Enrollment = enrollments.find(
          e => e.getStudent().getCPF() === testStudent.getCPF()
        );
        expect(student1Enrollment?.getSelfEvaluations()).toContainEqual(
          expect.objectContaining({ goal: 'Requirements', grade: 'MA' })
        );
      });
    });

    describe('All valid evaluation goals', () => {
      const validGoals = [
        'Requirements',
        'Configuration Management',
        'Project Management',
        'Design',
        'Tests',
        'Refactoring'
      ];

      test('should accept all standard evaluation goals', async () => {
        for (const goal of validGoals) {
          const response = await request(app)
            .put(`/api/classes/${testClass.getClassId()}/enrollments/${testStudent.getCPF()}/selfEvaluation`)
            .send({
              goal: goal,
              grade: 'MA'
            })
            .expect(200);

          expect(response.body.selfEvaluations).toContainEqual({
            goal: goal,
            grade: 'MA'
          });
        }

        // Verify all were added
        const finalResponse = await request(app)
          .get(`/api/classes/${testClass.getClassId()}/enrollments`);

        const enrollment = finalResponse.body.find(
          (e: any) => e.student.cpf === testStudent.getFormattedCPF()
        );

        expect(enrollment.selfEvaluations).toHaveLength(validGoals.length);
      });
    });
  });
});
