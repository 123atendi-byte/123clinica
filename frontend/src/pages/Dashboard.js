import React, { useState, useEffect } from 'react';
import { pacientesService, medicosService, agendaService } from '../services/api';
import { FaUsers, FaUserMd, FaCalendarCheck, FaClock } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPacientes: 0,
    totalMedicos: 0,
    consultasHoje: 0,
    consultasPendentes: 0,
  });
  const [proximasConsultas, setProximasConsultas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [pacientes, medicos, consultas] = await Promise.all([
        pacientesService.getAll(),
        medicosService.getAll(),
        agendaService.getConsultas({ data_inicio: today }),
      ]);

      setStats({
        totalPacientes: pacientes.data.length,
        totalMedicos: medicos.data.length,
        consultasHoje: consultas.data.filter(c => c.data_consulta === today).length,
        consultasPendentes: consultas.data.filter(c => c.status === 'agendada').length,
      });

      setProximasConsultas(consultas.data.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
            <FaUsers style={{ color: '#2563eb' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalPacientes}</h3>
            <p>Total de Pacientes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#d1fae5' }}>
            <FaUserMd style={{ color: '#16a34a' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalMedicos}</h3>
            <p>Médicos Ativos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
            <FaCalendarCheck style={{ color: '#ca8a04' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.consultasHoje}</h3>
            <p>Consultas Hoje</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0e7ff' }}>
            <FaClock style={{ color: '#6366f1' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.consultasPendentes}</h3>
            <p>Consultas Pendentes</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Próximas Consultas</h2>
        {proximasConsultas.length === 0 ? (
          <p className="empty-state">Nenhuma consulta agendada</p>
        ) : (
          <div className="consultas-list">
            {proximasConsultas.map((consulta) => (
              <div key={consulta.id} className="consulta-item">
                <div className="consulta-info">
                  <h4>{consulta.paciente.nome}</h4>
                  <p className="consulta-medico">Dr(a). {consulta.medico.nome} - {consulta.medico.especialidade}</p>
                </div>
                <div className="consulta-datetime">
                  <span className="consulta-data">{new Date(consulta.data_consulta + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  <span className="consulta-hora">{consulta.horario}</span>
                </div>
                <span className={`badge badge-${consulta.status === 'agendada' ? 'success' : 'warning'}`}>
                  {consulta.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
