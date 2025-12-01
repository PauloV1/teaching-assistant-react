import React, { useState, useEffect } from "react";
import ClassService from "../services/ClassService";
import EnrollmentService from "../services/EnrollmentService";
import { Class } from "../types/Class";

interface Props {
  onError: (msg: string) => void;
}

  const evaluationGoals = [
    'Requirements',
    'Configuration Management', 
    'Project Management',
    'Design',
    'Tests',
    'Refactoring'
  ];

const SelfEvaluation: React.FC<Props> = ({ onError }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const loadClasses = async () => {
    try {
      const data = await ClassService.getAllClasses();
      setClasses(data);

      // Se uma turma já estava selecionada, atualiza ela
      if (selectedClass) {
        const updated = data.find(c => c.id === selectedClass.id);
        if (updated) setSelectedClass(updated);
      }

    } catch (e) {
      onError("Failed to load classes");
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);

  const openModal = (title: string, message: string) => {
    setModal({ title, message });
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <div>
      <h2>Self-Evaluation Notification</h2>

      {/* Seleção de turma */}
      <select
        onChange={(e) => {
          const c = classes.find((cls) => cls.id === e.target.value);
          setSelectedClass(c || null);
        }}
      >
        <option value="">Selecione uma turma</option>
        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.topic} ({cls.year}/{cls.semester})
          </option>
        ))}
      </select>
      {selectedClass && (
  <table className="students-list" style={{ marginTop: "20px" }}>
    <thead>
      <tr>
        <th className="student-name-header">Student</th>
        {evaluationGoals.map((goal) => (
          <th key={goal} className="goal-header">{goal}</th>
        ))}
      </tr>
    </thead>

    <tbody>
      {/* Envio geral para cada meta */}
      <tr style={{ background: "#eef2ff" }}>
        <td style={{ fontWeight: "bold" }}>Envio Geral</td>

        {evaluationGoals.map((goal) => (
          <td key={goal}>
            <button
              onClick={() =>
                EnrollmentService.requestSelfEvaluationAll(
                  selectedClass.id,
                  goal
                )
                  .then(() => {
                    openModal(
                    "Sucesso!", // Título
                    `Pedido de autoavaliação solicitado para a turma: ${selectedClass.topic}, na meta: ${goal}` // Mensagem
                  );                    
                  loadClasses();
                  })
                  .catch((err) => onError(err.message))
              }
            >
              Enviar para todos
            </button>
          </td>
        ))}
      </tr>

      {/* cada aluno */}
      {selectedClass.enrollments?.map((enr) => (
        <tr key={enr.student.cpf}>
          <td>{enr.student.name}</td>

          {evaluationGoals.map(goal => (
            <td key={goal}>
              <button
                onClick={() =>
                  EnrollmentService.requestSelfEvaluation(
                    selectedClass.id,
                    enr.student.cpf,
                    goal
                  )
                  .then(() => {
                    openModal(
                    "Sucesso!",
                    `Pedido de autoavaliação solicitado para o aluno: ${enr.student.name}, na meta: ${goal}` // Mensagem
                  );                    
                  loadClasses();
                  })
                    .catch((err) => onError(err.message))
                }
              >
                Enviar
              </button>
            </td>
            ))}
              </tr>
            ))
          }
          </tbody>
        </table>
      )}

      {/* --- AQUI ESTÁ A CORREÇÃO: Renderização do Modal --- */}
      {modal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Fundo escuro transparente
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              maxWidth: "500px",
              width: "100%",
            }}
          >
            <h3 style={{ marginTop: 0 }}>{modal.title}</h3>
            <p>{modal.message}</p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "15px",
              }}
            >
              <button
                onClick={closeModal}
                style={{ padding: "8px 16px", cursor: "pointer" }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfEvaluation;