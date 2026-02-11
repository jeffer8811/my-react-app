import { useState, useEffect } from "react";
import axios from "axios";

export default function StudentFilter() {
  const [level, setLevel] = useState("");
  const [grade, setGrade] = useState("");
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);

  const levelGrades = {
    "Inicial": ["3 años", "4 años", "5 años"],
    "Primaria": ["1°", "2°", "3°", "4°", "5°", "6°"],
    "Secundaria": ["1°", "2°", "3°", "4°", "5°"]
  };

  useEffect(() => {
    if (level) setGrades(levelGrades[level]);
    else setGrades([]);
    setGrade("");
  }, [level]);

  const handleFilter = async () => {
    let url = `/api/students/filter?level=${level}`;
    if (grade) url += `&grade=${grade}`;
    const res = await axios.get(url);
    setStudents(res.data);
  };

  return (
    <div>
      <select value={level} onChange={e => setLevel(e.target.value)}>
        <option value="">Selecciona Nivel</option>
        <option value="Inicial">Inicial</option>
        <option value="Primaria">Primaria</option>
        <option value="Secundaria">Secundaria</option>
      </select>

      <select value={grade} onChange={e => setGrade(e.target.value)} disabled={!level}>
        <option value="">Selecciona Grado</option>
        {grades.map(g => <option key={g} value={g}>{g}</option>)}
      </select>

      <button onClick={handleFilter}>Filtrar</button>

      <ul>
        {students.map(s => <li key={s.id}>{s.name} - {s.level} {s.grade}</li>)}
      </ul>
    </div>
  );
}
