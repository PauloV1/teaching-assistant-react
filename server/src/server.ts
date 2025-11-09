import express, { Request, Response } from 'express';
import cors from 'cors';
import { StudentSet } from './models/StudentSet';
import { Student } from './models/Student';
import { Evaluation } from './models/Evaluation';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const PORT = 3005;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory student storage with file persistence
const studentSet = new StudentSet();
const dataFile = path.resolve('./data/students.json');

// Persistence functions
const ensureDataDirectory = (): void => {
  const dataDir = path.dirname(dataFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const saveStudentsToFile = (): void => {
  try {
    const data = {
      students: studentSet.getAllStudents().map(student => ({
        name: student.name,
        cpf: student.getCPF(),
        email: student.email,
        evaluations: student.evaluations.map(evaluation => evaluation.toJSON())
      }))
    };
    
    ensureDataDirectory();
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving students to file:', error);
  }
};

const loadStudentsFromFile = (): void => {
  try {
    if (fs.existsSync(dataFile)) {
      const fileContent = fs.readFileSync(dataFile, 'utf8');
      const data = JSON.parse(fileContent);
      
      if (data.students && Array.isArray(data.students)) {
        data.students.forEach((studentData: any) => {
          const evaluations = studentData.evaluations
            ? studentData.evaluations.map((evalData: any) => 
                Evaluation.fromJSON(evalData)
              )
            : [];
          
          const student = new Student(
            studentData.name,
            studentData.cpf,
            studentData.email,
            evaluations
          );
          
          try {
            studentSet.addStudent(student);
          } catch (error) {
            console.error(`Error adding student ${studentData.name}:`, error);
          }
        });
      }
    }
  } catch (error) {
    console.error('Error loading students from file:', error);
  }
};

// Trigger save after any modification (async to not block operations)
const triggerSave = (): void => {
  setImmediate(() => {
    saveStudentsToFile();
  });
};

// Load existing data on startup
loadStudentsFromFile();

// Helper function to clean CPF
const cleanCPF = (cpf: string): string => {
  return cpf.replace(/[.-]/g, '');
};

// Routes

// GET /api/students - Get all students
app.get('/api/students', (req: Request, res: Response) => {
  try {
    const students = studentSet.getAllStudents();
    res.json(students.map(s => s.toJSON()));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST /api/students - Add a new student
app.post('/api/students', (req: Request, res: Response) => {
  try {
    const { name, cpf, email, evaluations } = req.body;
    
    if (!name || !cpf || !email) {
      return res.status(400).json({ error: 'Name, CPF, and email are required' });
    }

    // Convert evaluations from JSON to Evaluation objects if provided
    const evaluationObjects = evaluations 
      ? evaluations.map((evaluation: any) => Evaluation.fromJSON(evaluation))
      : [];

    const student = new Student(name, cpf, email, evaluationObjects);
    const addedStudent = studentSet.addStudent(student);
    triggerSave(); // Save to file after adding
    res.status(201).json(addedStudent.toJSON());
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// PUT /api/students/:cpf - Update a student
app.put('/api/students/:cpf', (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;
    const { name, email, evaluations } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required for update' });
    }
    
    // Convert evaluations from JSON to Evaluation objects if provided
    const evaluationObjects = evaluations 
      ? evaluations.map((evaluation: any) => Evaluation.fromJSON(evaluation))
      : [];
    
    // Create a Student object for update (evaluations will be properly updated in updateStudent)
    const updatedStudent = new Student(name, cpf, email, evaluationObjects);
    const result = studentSet.updateStudent(updatedStudent);
    triggerSave(); // Save to file after updating
    res.json(result.toJSON());
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// DELETE /api/students/:cpf - Delete a student
app.delete('/api/students/:cpf', (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;
    const cleanedCPF = cleanCPF(cpf);
    const success = studentSet.removeStudent(cleanedCPF);
    
    if (!success) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    triggerSave(); // Save to file after deleting
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// PUT /api/students/:cpf/evaluation - Update a specific evaluation
app.put('/api/students/:cpf/evaluation', (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;
    const { goal, grade } = req.body;
    
    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }
    
    const cleanedCPF = cleanCPF(cpf);
    const student = studentSet.findStudentByCPF(cleanedCPF);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    if (grade === '' || grade === null || grade === undefined) {
      // Remove evaluation
      student.removeEvaluation(goal);
    } else {
      // Add or update evaluation
      if (!['MANA', 'MPA', 'MA'].includes(grade)) {
        return res.status(400).json({ error: 'Invalid grade. Must be MANA, MPA, or MA' });
      }
      student.addOrUpdateEvaluation(goal, grade);
    }
    
    triggerSave(); // Save to file after evaluation update
    res.json(student.toJSON());
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// GET /api/students/:cpf - Get a specific student
app.get('/api/students/:cpf', (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;
    const cleanedCPF = cleanCPF(cpf);
    const student = studentSet.findStudentByCPF(cleanedCPF);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student.toJSON());
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});