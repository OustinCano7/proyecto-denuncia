import { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";
import "./Dashboard.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

/* ===== CONFIG ===== */
const TIPOS = [
  "SUELO",
  "AIRE",
  "AGUA",
  "RUIDO",
  "FLORA SILVESTRE",
  "FAUNA SILVESTRE"
];

const LABELS = [
  "Suelo",
  "Aire",
  "Agua",
  "Ruido",
  "Flora silvestre",
  "Fauna silvestre"
];

const COLORES = [
  "#7B1E3A",
  "#0d6efd",
  "#198754",
  "#ffc107",
  "#20c997",
  "#6f42c1"
];

const ESTADOS_INSPECCION = [
  "INSPECCION AGENDADA",
  "ACTA LEVANTADA",
  "CITATORIO DEJADO",
  "AUDIENCIA AGENDADA"
];

/* ===== ANIMACIÓN DE CONTEO ===== */
const useCounter = (value, duration = 800) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return count;
};

function Dashboard() {
  const [denuncias, setDenuncias] = useState([]);

  useEffect(() => {
    fetch("http://localhost/proyecto-denuncia/backend/get_denuncias.php")
      .then(res => res.json())
      .then(data => setDenuncias(data || []))
      .catch(() => setDenuncias([]));
  }, []);

  /* ===== NORMALIZADOR ROBUSTO ===== */
  const norm = (v = "") =>
    v
      .trim()
      .toUpperCase()
      .replace(/_/g, " ")
      .replace(/\s+/g, " ");

  const hoy = new Date();

  /* ===== KPIs ===== */
  const total = denuncias.length;

  const pendientes = denuncias.filter(
    d => norm(d.estado_procedimiento) === "RECIBIDA"
  ).length;

  const enInspeccion = denuncias.filter(
    d => ESTADOS_INSPECCION.includes(norm(d.estado_procedimiento))
  ).length;

  const resueltasMes = denuncias.filter(d => {
    if (norm(d.estado_procedimiento) !== "RESUELTA") return false;
    const f = new Date(d.created_at);
    return (
      f.getMonth() === hoy.getMonth() &&
      f.getFullYear() === hoy.getFullYear()
    );
  }).length;

  /* ===== CONTADORES ANIMADOS ===== */
  const totalAnim = useCounter(total);
  const pendientesAnim = useCounter(pendientes);
  const inspeccionAnim = useCounter(enInspeccion);
  const resueltasAnim = useCounter(resueltasMes);

  /* ===== GRAFICAS ===== */
  const conteoTipos = TIPOS.map(tipo =>
    denuncias.filter(d => norm(d.tipo_denuncia) === tipo).length
  );

  const totalTipos = conteoTipos.reduce((a, b) => a + b, 0);

  const pieData = {
    labels: LABELS,
    datasets: [
      {
        data: conteoTipos,
        backgroundColor: COLORES
      }
    ]
  };

  const barData = {
    labels: LABELS,
    datasets: [
      {
        label: "Denuncias",
        data: conteoTipos,
        backgroundColor: COLORES
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: ctx => {
            const value = ctx.raw;
            const pct = totalTipos
              ? ((value / totalTipos) * 100).toFixed(1)
              : 0;
            return `${ctx.label}: ${value} (${pct}%)`;
          }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard de Denuncias</h2>

      {/* ===== KPIs ===== */}
      <div className="kpis-grid">
        <div className="kpi-card total">
          <h3>Denuncias totales</h3>
          <p>{totalAnim}</p>
        </div>

        <div className="kpi-card pendientes">
          <h3>Pendientes</h3>
          <p>{pendientesAnim}</p>
        </div>

        <div className="kpi-card inspeccion">
          <h3>En inspección</h3>
          <p>{inspeccionAnim}</p>
        </div>

        <div className="kpi-card resueltas">
          <h3>Resueltas del mes</h3>
          <p>{resueltasAnim}</p>
        </div>
      </div>

      {/* ===== GRAFICAS ===== */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Tipos de denuncia (%)</h3>
          <div className="chart-wrapper">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Distribución por tipo</h3>
          <div className="chart-wrapper">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
