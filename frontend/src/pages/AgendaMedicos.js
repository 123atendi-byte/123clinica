import React, { useState, useEffect } from 'react';
import { medicosService, agendaMedicosService } from '../services/api';
import { FaPlus, FaTrash, FaClock } from 'react-icons/fa';
import './AgendaMedicos.css';

const AgendaMedicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [formData, setFormData] = useState({
    medico_id: '',
    dia_semana: '',
    horario_inicio: '',
    horario_fim: '',
    intervalo_minutos: 30,
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const diasSemana = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [medicosRes, agendasRes] = await Promise.all([
        medicosService.getAll(),
        agendaMedicosService.getAll(),
      ]);
      setMedicos(medicosRes.data);
      setAgendas(agendasRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await agendaMedicosService.create({
        ...formData,
        dia_semana: parseInt(formData.dia_semana),
      });
      setMessage({ type: 'success', text: 'Horário adicionado com sucesso!' });
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Erro ao adicionar horário',
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este horário?')) {
      try {
        await agendaMedicosService.delete(id);
        loadData();
      } catch (error) {
        alert('Erro ao deletar horário');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      medico_id: '',
      dia_semana: '',
      horario_inicio: '',
      horario_fim: '',
      intervalo_minutos: 30,
    });
    setSelectedMedico(null);
  };

  const openModal = (medico) => {
    setSelectedMedico(medico);
    setFormData({ ...formData, medico_id: medico.id });
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  const getAgendasPorMedico = (medicoId) => {
    return agendas.filter((a) => a.medico_id === medicoId);
  };

  const getDiaSemanaLabel = (dia) => {
    return diasSemana.find((d) => d.value === dia)?.label || '';
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="agenda-medicos">
      <h1>Gerenciar Agendas dos Médicos</h1>

      {message.text && (
        <div className={message.type === 'success' ? 'success' : 'error'}>
          {message.text}
        </div>
      )}

      <div className="medicos-grid">
        {medicos.map((medico) => {
          const agendasMedico = getAgendasPorMedico(medico.id);
          return (
            <div key={medico.id} className="card medico-card">
              <div className="medico-header">
                <div>
                  <h3>{medico.nome}</h3>
                  <p className="especialidade">{medico.especialidade}</p>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => openModal(medico)}
                >
                  <FaPlus /> Adicionar Horário
                </button>
              </div>

              <div className="agendas-list">
                {agendasMedico.length === 0 ? (
                  <p className="empty-state">Nenhum horário configurado</p>
                ) : (
                  agendasMedico.map((agenda) => (
                    <div key={agenda.id} className="agenda-item">
                      <div className="agenda-info">
                        <strong>{getDiaSemanaLabel(agenda.dia_semana)}</strong>
                        <div className="horario-info">
                          <FaClock />
                          {agenda.horario_inicio} - {agenda.horario_fim}
                          <span className="intervalo">
                            (Intervalo: {agenda.intervalo_minutos} min)
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(agenda.id)}
                        title="Remover"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                Adicionar Horário - {selectedMedico?.nome}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Dia da Semana *</label>
                <select
                  className="input"
                  value={formData.dia_semana}
                  onChange={(e) =>
                    setFormData({ ...formData, dia_semana: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione um dia</option>
                  {diasSemana.map((dia) => (
                    <option key={dia.value} value={dia.value}>
                      {dia.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Horário Início *</label>
                  <input
                    type="time"
                    className="input"
                    value={formData.horario_inicio}
                    onChange={(e) =>
                      setFormData({ ...formData, horario_inicio: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Horário Fim *</label>
                  <input
                    type="time"
                    className="input"
                    value={formData.horario_fim}
                    onChange={(e) =>
                      setFormData({ ...formData, horario_fim: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Intervalo entre Consultas (minutos) *</label>
                <select
                  className="input"
                  value={formData.intervalo_minutos}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      intervalo_minutos: parseInt(e.target.value),
                    })
                  }
                  required
                >
                  <option value="15">15 minutos</option>
                  <option value="20">20 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="40">40 minutos</option>
                  <option value="60">60 minutos</option>
                </select>
              </div>

              <div className="info-box">
                <strong>Atenção:</strong> Só é permitido um horário por dia da semana.
                Se precisar de dois períodos (manhã e tarde), adicione-os separadamente.
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaMedicos;
