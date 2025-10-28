import React, { useState, useEffect } from 'react';
import { agendaService } from '../services/api';
import { FaFilter, FaEye, FaTrash } from 'react-icons/fa';
import './Consultas.css';

const Consultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    data_inicio: '',
    data_fim: '',
    status: '',
  });
  const [selectedConsulta, setSelectedConsulta] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadConsultas();
  }, [filters]);

  const loadConsultas = async () => {
    try {
      const params = {};
      if (filters.data_inicio) params.data_inicio = filters.data_inicio;
      if (filters.data_fim) params.data_fim = filters.data_fim;
      if (filters.status) params.status = filters.status;

      const response = await agendaService.getConsultas(params);
      setConsultas(response.data);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (id) => {
    if (window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      try {
        await agendaService.cancelar(id);
        loadConsultas();
      } catch (error) {
        alert('Erro ao cancelar consulta');
      }
    }
  };

  const handleDeletar = async (id) => {
    if (window.confirm('Tem certeza que deseja DELETAR PERMANENTEMENTE esta consulta? Esta ação não pode ser desfeita!')) {
      try {
        await agendaService.deletar(id);
        loadConsultas();
      } catch (error) {
        alert('Erro ao deletar consulta');
      }
    }
  };

  const handleViewDetails = (consulta) => {
    setSelectedConsulta(consulta);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      agendada: 'badge-success',
      confirmada: 'badge-success',
      cancelada: 'badge-danger',
      realizada: 'badge-warning',
    };
    return badges[status] || 'badge-success';
  };

  const getStatusLabel = (status) => {
    const labels = {
      agendada: 'Agendada',
      confirmada: 'Confirmada',
      cancelada: 'Cancelada',
      realizada: 'Realizada',
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="consultas">
      <h1>Consultas Agendadas</h1>

      <div className="card filters-card">
        <h3>
          <FaFilter /> Filtros
        </h3>
        <div className="filters-grid">
          <div className="form-group">
            <label className="label">Data Início</label>
            <input
              type="date"
              className="input"
              value={filters.data_inicio}
              onChange={(e) => setFilters({ ...filters, data_inicio: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="label">Data Fim</label>
            <input
              type="date"
              className="input"
              value={filters.data_fim}
              onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="label">Status</label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="agendada">Agendada</option>
              <option value="confirmada">Confirmada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label" style={{ opacity: 0 }}>Ação</label>
            <button
              className="btn btn-secondary"
              onClick={() => setFilters({ data_inicio: '', data_fim: '', status: '' })}
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="consultas-count">
          Total de consultas: <strong>{consultas.length}</strong>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Especialidade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {consultas.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    Nenhuma consulta encontrada
                  </td>
                </tr>
              ) : (
                consultas.map((consulta) => (
                  <tr key={consulta.id}>
                    <td>{new Date(consulta.data_consulta + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td>{consulta.horario}</td>
                    <td>{consulta.paciente.nome}</td>
                    <td>Dr(a). {consulta.medico.nome}</td>
                    <td>{consulta.medico.especialidade}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(consulta.status)}`}>
                        {getStatusLabel(consulta.status)}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => handleViewDetails(consulta)}
                          title="Ver detalhes"
                        >
                          <FaEye />
                        </button>
                        {consulta.status !== 'cancelada' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelar(consulta.id)}
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeletar(consulta.id)}
                          title="Deletar permanentemente"
                          style={{ color: '#ef4444', marginLeft: '0.5rem' }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedConsulta && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes da Consulta</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <strong>Data:</strong>
                <span>{new Date(selectedConsulta.data_consulta + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="detail-group">
                <strong>Horário:</strong>
                <span>{selectedConsulta.horario}</span>
              </div>
              <div className="detail-group">
                <strong>Paciente:</strong>
                <span>{selectedConsulta.paciente.nome}</span>
              </div>
              <div className="detail-group">
                <strong>Telefone:</strong>
                <span>{selectedConsulta.paciente.telefone}</span>
              </div>
              <div className="detail-group">
                <strong>Médico:</strong>
                <span>Dr(a). {selectedConsulta.medico.nome}</span>
              </div>
              <div className="detail-group">
                <strong>Especialidade:</strong>
                <span>{selectedConsulta.medico.especialidade}</span>
              </div>
              <div className="detail-group">
                <strong>Status:</strong>
                <span className={`badge ${getStatusBadge(selectedConsulta.status)}`}>
                  {getStatusLabel(selectedConsulta.status)}
                </span>
              </div>
              {selectedConsulta.observacoes && (
                <div className="detail-group">
                  <strong>Observações:</strong>
                  <span>{selectedConsulta.observacoes}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultas;
