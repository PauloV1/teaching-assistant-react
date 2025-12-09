import { defineFeature, loadFeature } from 'jest-cucumber';
import request from 'supertest';
import { app } from '../../src/server';

const feature = loadFeature('./tests/features/selfEvaluation.feature');

let classId: string;
let response: request.Response;

defineFeature(feature, test => {

  test('Enviando solicitação autoavaliação para um aluno com sucesso', ({ given, when, then, and }) => {

    given(
      /^o sistema possui a turma "(.*)" com o aluno de CPF "(.*)" matriculado$/,
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
  // --- NOVO TESTE 2: BLOQUEAR ENVIO PARA ALUNO QUE JÁ RESPONDEU ---
  test('Enviando solicitação autoavaliação para um aluno que já respondeu a autoavaliação', ({ given, when, then, and }) => {
    
    let currentCpf: string;

    given(/^existe um aluno que já completou a autoavaliação da meta "(.*)"$/, async (goal) => {
      // 1. Criar dados únicos
      const timestamp = Date.now();
      currentCpf = `${timestamp}`.slice(-11);
      
      // Criar Aluno
      await request(app).post('/api/students').send({
        name: "Aluno Adiantado",
        cpf: currentCpf,
        email: "adiantado@teste.com"
      });

      // Criar Turma
      const classRes = await request(app).post('/api/classes').send({
        topic: `Turma Bloqueio ${timestamp}`,
        semester: 1,
        year: 2025
      });
      classId = classRes.body.id; // Atualiza a variável global classId

      // Matricular
      await request(app).post(`/api/classes/${classId}/enroll`).send({
        studentCPF: currentCpf
      });

      // 2. AÇÃO PREPARATÓRIA: Preencher a meta ANTES de solicitar
      // Simula que o aluno já respondeu a avaliação (PUT na rota de update)
      await request(app)
        .put(`/api/classes/${classId}/enrollments/${currentCpf}/selfEvaluation/${goal}`)
        .send({ goal: goal, grade: "MA" }); 
    });

    when(/^eu solicito o envio de autoavaliação da meta "(.*)" para este aluno$/, async (goal) => {
      // Tenta solicitar o e-mail para a meta que já foi preenchida
      response = await request(app)
        .post(`/api/classes/${classId}/enrollments/${currentCpf}/requestSelfEvaluation/${goal}`)
        .send({ intervalHours: 24 });
    });

    then(/^o sistema deve retornar o status (\d+)$/, (status) => {
      expect(response.status).toBe(Number(status));
    });

    and('a resposta deve informar que o aluno já preencheu a meta', () => {
      // Verifica se a mensagem contém o aviso de bloqueio
      expect(response.body.message).toMatch(/already filled/i);
    });
  });


  // --- TESTE 3: ALUNO NÃO MATRICULADO ---
  test('Enviando Email para aluno não cadastrado na turma', ({ given, when, then, and }) => {
    
    given('existe uma turma cadastrada', async () => {
      const timestamp = Date.now();
      // Apenas cria a turma, sem matricular ninguém
      const classRes = await request(app).post('/api/classes').send({
        topic: `Turma Vazia ${timestamp}`,
        semester: 1,
        year: 2025
      });
      classId = classRes.body.id; // Atualiza a variável global
    });

    when(/^eu tento solicitar autoavaliação para um CPF "(.*)" não matriculado nessa turma$/, async (cpfInvalido) => {
      // Tenta enviar para um CPF que não está na lista de enrollments dessa turma
      response = await request(app)
        .post(`/api/classes/${classId}/enrollments/${cpfInvalido}/requestSelfEvaluation/Requirements`)
        .send();
    });

    then(/^o sistema deve retornar o status (\d+)$/, (status) => {
      expect(response.status).toBe(Number(status));
    });

    and(/^a resposta deve conter o erro "(.*)"$/, (msgErro) => {
      // Verifica se o corpo da resposta (error ou message) contém o texto esperado
      const msg = response.body.error || response.body.message;
      expect(msg).toMatch(new RegExp(msgErro));
    });
  });
});
