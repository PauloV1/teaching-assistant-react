import { defineFeature, loadFeature } from 'jest-cucumber';
import request from 'supertest';
import { app } from '../../src/server';

const feature = loadFeature('./tests/features/selfEvaluation.feature');

let classId: string;
let response: request.Response;

defineFeature(feature, test => {

  test('Aluno recebe solicitação de autoavaliação com sucesso', ({ given, when, then, and }) => {

    given(
      /^que o sistema possui a turma "(.*)" com o aluno de CPF "(.*)" matriculado$/,
      async (alias, cpf) => {

        const cleanCPF = cpf.replace(/[^\d]/g, '');

        // Cria o aluno
        await request(app).post('/api/students').send({
          name: "Aluno Teste",
          cpf: cleanCPF,
          email: "aluno@teste.com"
        });

        // Cria a turma
        const classRes = await request(app).post('/api/classes').send({
          topic: `Turma ${Date.now()}`,
          semester: 1,
          year: 2025
        });

        classId = classRes.body.id;

        // Matricula o aluno
        await request(app)
          .post(`/api/classes/${classId}/enroll`)
          .send({ studentCPF: cleanCPF });

        const classData = await request(app).get(`/api/classes/${classId}`);
      }
    );

when(
  /^eu solicito o envio de autoavaliação da meta "(.*)" para o aluno "(.*)" da turma "(.*)"$/,
  async (goal, cpf, alias) => {

    const cleanCPF = cpf.replace(/[^\d]/g, '');
    response = await request(app)
      .post(`/api/classes/${classId}/enrollments/${cleanCPF}/requestSelfEvaluation/${goal}`)
      .send();
  }
);

    then(
      /^o sistema deve retornar um status de sucesso (\d+)$/,
      expectedStatus => {
        expect(response.status).toBe(Number(expectedStatus));
      }
    );

    and(
      /^a mensagem de resposta deve indicar "(.*)"$/,
      expectedMessage => {
        expect(response.body.message).toBe(expectedMessage);
      }
    );

  });

});
