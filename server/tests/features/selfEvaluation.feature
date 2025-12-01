Feature: Solicitação de Autoavaliação

  Scenario: Aluno recebe solicitação de autoavaliação com sucesso
    Given que o sistema possui a turma "c1" com o aluno de CPF "12345678909" matriculado
    When eu solicito o envio de autoavaliação da meta "Requirements" para o aluno "12345678909" da turma "c1"
    Then o sistema deve retornar um status de sucesso 200
    And a mensagem de resposta deve indicar "Request created"