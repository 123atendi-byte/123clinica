import React, { useState, useEffect } from 'react';
import { agendaService, medicosService, bloqueiosService } from '../services/api';
import { FaCalendarAlt, FaEdit, FaTrash, FaClock, FaUser, FaFilter, FaChevronLeft, FaChevronRight, FaCalendarWeek, FaBan, FaLock, FaUnlock } from 'react-icons/fa';
import './Agenda.css';
import './AgendaBloqueios.css';

const Agenda = () => {
  const [medicos, setMedicos] = useState([]);
  const [selectedMedico, setSelectedMedico] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('week'); // 'day' ou 'week'
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [consultasSemana, setConsultasSemana] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [horariosLivres, setHorariosLivres] = useState([]);
  const [horariosLivresSemana, setHorariosLivresSemana] = useState({});
  const [bloqueiosSemana, setBloqueiosSemana] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBloqueioModal, setShowBloqueioModal] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState(null);
  const [bloqueioData, setBloqueioData] = useState({
    data_inicio: '',
    data_fim: '',
    horario_inicio: '',
    horario_fim: '',
    motivo: '',
    tipo: 'dia_inteiro' // 'dia_inteiro' ou 'horario'
  });

  useEffect(() => {
    loadMedicos();
  }, []);

  useEffect(() => {
    if (selectedMedico) {
      if (viewMode === 'week') {
        loadAgendaSemana();
        loadHorariosLivresSemana();
        loadBloqueiosSemana();
      } else {
        loadAgendaDia();
        loadHorariosLivres();
      }
    }
  }, [selectedMedico, selectedDate, weekStart, viewMode]);

  function getMonday(d) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  const getDaysOfWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  };

  const loadMedicos = async () => {
    try {
      const response = await medicosService.getAll();
      const data = Array.isArray(response.data) ? response.data : [];
      setMedicos(data);
      if (data.length > 0) {
        setSelectedMedico(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
      setMedicos([]);
    }
  };

  const loadAgendaSemana = async () => {
    setLoading(true);
    try {
      const dataInicio = formatDate(weekStart);
      const dataFim = formatDate(addDays(weekStart, 6));

      const response = await agendaService.getConsultas({
        medico_id: selectedMedico,
        data_inicio: dataInicio,
        data_fim: dataFim,
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setConsultasSemana(data);
    } catch (error) {
      console.error('Erro ao carregar consultas da semana:', error);
      setConsultasSemana([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAgendaDia = async () => {
    setLoading(true);
    try {
      const response = await agendaService.getConsultas({
        medico_id: selectedMedico,
        data_inicio: selectedDate,
        data_fim: selectedDate,
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setConsultas(data.sort((a, b) => a.horario.localeCompare(b.horario)));
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
      setConsultas([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHorariosLivres = async () => {
    try {
      const response = await agendaService.getHorariosLivres(selectedMedico, selectedDate);
      setHorariosLivres(response.data.horarios_livres || []);
    } catch (error) {
      console.error('Erro ao carregar horários livres:', error);
      setHorariosLivres([]);
    }
  };

  const loadHorariosLivresSemana = async () => {
    const days = getDaysOfWeek();
    const promises = days.map(async (day) => {
      const dateStr = formatDate(day);
      try {
        const response = await agendaService.getHorariosLivres(selectedMedico, dateStr);
        return { date: dateStr, data: response.data };
      } catch (error) {
        return { date: dateStr, data: { horarios_livres: [], bloqueado: false } };
      }
    });

    const results = await Promise.all(promises);
    const horariosMap = {};
    results.forEach(r => {
      horariosMap[r.date] = r.data;
    });
    setHorariosLivresSemana(horariosMap);
  };

  const loadBloqueiosSemana = async () => {
    const dataInicio = formatDate(weekStart);
    const dataFim = formatDate(addDays(weekStart, 6));

    try {
      const response = await bloqueiosService.getAll({
        medico_id: selectedMedico,
        data_inicio: dataInicio,
        data_fim: dataFim
      });
      setBloqueiosSemana(response.data);
    } catch (error) {
      console.error('Erro ao carregar bloqueios:', error);
      setBloqueiosSemana([]);
    }
  };

  const getConsultasPorDia = (date) => {
    const dateStr = formatDate(date);
    return consultasSemana
      .filter(c => c.data_consulta === dateStr)
      .sort((a, b) => a.horario.localeCompare(b.horario));
  };

  const handleEdit = (consulta) => {
    setEditingConsulta(consulta);
    setShowEditModal(true);
  };

  const handleCancelar = async (id) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        await agendaService.cancelar(id);
        if (viewMode === 'week') {
          loadAgendaSemana();
        } else {
          loadAgendaDia();
          loadHorariosLivres();
        }
      } catch (error) {
        alert('Erro ao cancelar agendamento');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja DELETAR PERMANENTEMENTE este agendamento? Esta ação não pode ser desfeita!')) {
      try {
        await agendaService.deletar(id);
        if (viewMode === 'week') {
          loadAgendaSemana();
        } else {
          loadAgendaDia();
          loadHorariosLivres();
        }
      } catch (error) {
        alert('Erro ao deletar agendamento');
      }
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await agendaService.updateStatus(editingConsulta.id, {
        status: editingConsulta.status,
        observacoes: editingConsulta.observacoes,
      });
      setShowEditModal(false);
      if (viewMode === 'week') {
        loadAgendaSemana();
      } else {
        loadAgendaDia();
      }
    } catch (error) {
      alert('Erro ao atualizar consulta');
    }
  };

  const handleCriarBloqueio = (dateStr) => {
    setBloqueioData({
      data_inicio: dateStr,
      data_fim: dateStr,
      horario_inicio: '',
      horario_fim: '',
      motivo: '',
      tipo: 'dia_inteiro'
    });
    setShowBloqueioModal(true);
  };

  const handleSalvarBloqueio = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        medico_id: selectedMedico,
        data_inicio: bloqueioData.data_inicio,
        data_fim: bloqueioData.data_fim,
        motivo: bloqueioData.motivo
      };

      // Só enviar horários se for bloqueio por horário
      if (bloqueioData.tipo === 'horario') {
        payload.horario_inicio = bloqueioData.horario_inicio;
        payload.horario_fim = bloqueioData.horario_fim;
      }

      await bloqueiosService.create(payload);
      setShowBloqueioModal(false);
      loadBloqueiosSemana();
      loadHorariosLivresSemana();
      loadAgendaSemana();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao criar bloqueio');
    }
  };

  const handleRemoverBloqueio = async (dateStr) => {
    const bloqueio = bloqueiosSemana.find(b =>
      dateStr >= b.data_inicio && dateStr <= b.data_fim
    );

    if (bloqueio && window.confirm(`Tem certeza que deseja remover o bloqueio: ${bloqueio.motivo || 'Sem motivo'}?`)) {
      try {
        await bloqueiosService.delete(bloqueio.id);
        loadBloqueiosSemana();
        loadHorariosLivresSemana();
      } catch (error) {
        alert('Erro ao remover bloqueio');
      }
    }
  };

  const handlePreviousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const handleNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const handleToday = () => {
    const today = new Date();
    setWeekStart(getMonday(today));
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const getStatusColor = (status) => {
    const colors = {
      agendada: '#22c55e',
      confirmada: '#3b82f6',
      realizada: '#f59e0b',
      cancelada: '#ef4444',
    };
    return colors[status] || '#22c55e';
  };

  const getStatusLabel = (status) => {
    const labels = {
      agendada: 'Agendada',
      confirmada: 'Confirmada',
      realizada: 'Realizada',
      cancelada: 'Cancelada',
    };
    return labels[status] || status;
  };

  const getDayName = (date) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[new Date(date).getDay()];
  };

  const medicoSelecionado = medicos.find(m => m.id == selectedMedico);

  return (
    <div className="agenda">
      <div className="page-header">
        <h1><FaCalendarAlt /> Agenda de Consultas</h1>
        <div className="view-toggle">
          <button
            className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('day')}
          >
            <FaCalendarAlt /> Dia
          </button>
          <button
            className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('week')}
          >
            <FaCalendarWeek /> Semana
          </button>
        </div>
      </div>

      <div className="agenda-filters">
        <div className="card">
          <h3><FaFilter /> Filtros</h3>
          <div className="filters-grid">
            <div className="form-group">
              <label className="label">Médico</label>
              <select
                className="input"
                value={selectedMedico}
                onChange={(e) => setSelectedMedico(e.target.value)}
              >
                {medicos.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    Dr(a). {medico.nome} - {medico.especialidade}
                  </option>
                ))}
              </select>
            </div>

            {viewMode === 'day' && (
              <div className="form-group">
                <label className="label">Data</label>
                <input
                  type="date"
                  className="input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            )}
          </div>

          {medicoSelecionado && (
            <div className="medico-info">
              <strong>Dr(a). {medicoSelecionado.nome}</strong>
              <span>{medicoSelecionado.especialidade}</span>
              <span>CRM: {medicoSelecionado.crm}</span>
            </div>
          )}
        </div>
      </div>

      {viewMode === 'week' ? (
        <div className="week-view">
          <div className="week-navigation">
            <button className="btn btn-secondary" onClick={handlePreviousWeek}>
              <FaChevronLeft /> Semana Anterior
            </button>
            <button className="btn btn-secondary" onClick={handleToday}>
              Hoje
            </button>
            <button className="btn btn-secondary" onClick={handleNextWeek}>
              Próxima Semana <FaChevronRight />
            </button>
          </div>

          <div className="week-grid">
            {getDaysOfWeek().map((day, index) => {
              const consultasDia = getConsultasPorDia(day);
              const isToday = formatDate(day) === formatDate(new Date());

              return (
                <div key={index} className={`day-column ${isToday ? 'today' : ''}`}>
                  <div className="day-header">
                    <div className="day-name">{getDayName(day)}</div>
                    <div className="day-date">
                      {new Date(day).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </div>
                    {consultasDia.length > 0 && (
                      <div className="day-count">{consultasDia.length} consulta{consultasDia.length > 1 ? 's' : ''}</div>
                    )}
                  </div>

                  <div className="day-consultas">
                    {(() => {
                      const dateStr = formatDate(day);
                      const horariosInfo = horariosLivresSemana[dateStr];

                      // Verificar se está bloqueado
                      if (horariosInfo?.bloqueado) {
                        return (
                          <div className="bloqueio-indicator">
                            <FaLock size={24} />
                            <div style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>Bloqueado</div>
                            <small>{horariosInfo.motivo}</small>
                            <button
                              className="btn-remover-bloqueio"
                              onClick={() => handleRemoverBloqueio(dateStr)}
                            >
                              <FaUnlock /> Desbloquear
                            </button>
                          </div>
                        );
                      }

                      // Verificar se não tem agenda configurada
                      if (horariosInfo?.mensagem) {
                        return (
                          <div className="no-agenda">
                            <FaBan size={20} />
                            <div>Sem agenda</div>
                          </div>
                        );
                      }

                      return (
                        <>
                          {/* Consultas agendadas */}
                          {consultasDia.map((consulta) => (
                            <div key={consulta.id} className="consulta-card-mini">
                              <div className="consulta-time-mini">{consulta.horario}</div>
                              <div className="consulta-patient-mini">{consulta.paciente.nome}</div>
                              <div
                                className="consulta-status-mini"
                                style={{ backgroundColor: getStatusColor(consulta.status) }}
                              >
                                {getStatusLabel(consulta.status)}
                              </div>
                              <div className="consulta-actions-mini">
                                <button
                                  className="btn-icon-mini btn-edit"
                                  onClick={() => handleEdit(consulta)}
                                  title="Editar"
                                >
                                  <FaEdit />
                                </button>
                                {consulta.status !== 'cancelada' && (
                                  <button
                                    className="btn-icon-mini btn-cancel"
                                    onClick={() => handleCancelar(consulta.id)}
                                    title="Cancelar"
                                    style={{ color: '#f59e0b' }}
                                  >
                                    <FaBan />
                                  </button>
                                )}
                                <button
                                  className="btn-icon-mini btn-delete"
                                  onClick={() => handleDelete(consulta.id)}
                                  title="Deletar permanentemente"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Horários livres */}
                          {horariosInfo?.horarios_livres && horariosInfo.horarios_livres.length > 0 && (
                            <div className="horarios-livres-container">
                              <div className="horarios-livres-title">
                                <FaClock size={12} /> Horários vagos ({horariosInfo.horarios_livres.length})
                              </div>
                              <div className="horarios-livres-list">
                                {horariosInfo.horarios_livres.slice(0, 4).map(horario => (
                                  <div key={horario} className="horario-livre-item">
                                    {horario}
                                  </div>
                                ))}
                                {horariosInfo.horarios_livres.length > 4 && (
                                  <small className="mais-horarios">
                                    +{horariosInfo.horarios_livres.length - 4} mais
                                  </small>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Botão para bloquear dia */}
                          <button
                            className="btn-bloquear-dia"
                            onClick={() => handleCriarBloqueio(dateStr)}
                            title="Bloquear este dia"
                          >
                            <FaLock size={12} /> Bloquear
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="agenda-content">
          <div className="card consultas-card">
            <h3><FaUser /> Consultas Agendadas ({consultas.length})</h3>

            {loading ? (
              <div className="loading">Carregando...</div>
            ) : consultas.length === 0 ? (
              <div className="empty-state">
                <FaCalendarAlt size={48} />
                <p>Nenhuma consulta agendada para esta data</p>
              </div>
            ) : (
              <div className="consultas-list">
                {consultas.map((consulta) => (
                  <div key={consulta.id} className="consulta-item">
                    <div className="consulta-header">
                      <div className="consulta-time">
                        <FaClock />
                        <strong>{consulta.horario}</strong>
                      </div>
                      <span
                        className="consulta-status"
                        style={{ backgroundColor: getStatusColor(consulta.status) }}
                      >
                        {getStatusLabel(consulta.status)}
                      </span>
                    </div>

                    <div className="consulta-body">
                      <div className="consulta-info">
                        <strong>Paciente:</strong> {consulta.paciente.nome}
                      </div>
                      <div className="consulta-info">
                        <strong>Telefone:</strong> {consulta.paciente.telefone}
                      </div>
                      {consulta.observacoes && (
                        <div className="consulta-info">
                          <strong>Observações:</strong> {consulta.observacoes}
                        </div>
                      )}
                    </div>

                    <div className="consulta-actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(consulta)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      {consulta.status !== 'cancelada' && (
                        <button
                          className="btn-icon btn-cancel"
                          onClick={() => handleCancelar(consulta.id)}
                          title="Cancelar"
                          style={{ color: '#f59e0b' }}
                        >
                          <FaBan />
                        </button>
                      )}
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(consulta.id)}
                        title="Deletar permanentemente"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card horarios-card">
            <h3><FaClock /> Horários Disponíveis</h3>

            {horariosLivres.length === 0 ? (
              <div className="empty-state">
                <FaClock size={48} />
                <p>Nenhum horário disponível para esta data</p>
              </div>
            ) : (
              <div className="horarios-grid">
                {horariosLivres.map((horario, index) => (
                  <div key={index} className="horario-item">
                    <FaClock />
                    <span>{horario}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showEditModal && editingConsulta && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Consulta</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateStatus}>
              <div className="modal-body">
                <div className="detail-group">
                  <strong>Data:</strong>
                  <span>{new Date(editingConsulta.data_consulta + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="detail-group">
                  <strong>Horário:</strong>
                  <span>{editingConsulta.horario}</span>
                </div>
                <div className="detail-group">
                  <strong>Paciente:</strong>
                  <span>{editingConsulta.paciente.nome}</span>
                </div>
                <div className="detail-group">
                  <strong>Médico:</strong>
                  <span>Dr(a). {editingConsulta.medico.nome}</span>
                </div>

                <div className="form-group">
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={editingConsulta.status}
                    onChange={(e) => setEditingConsulta({ ...editingConsulta, status: e.target.value })}
                  >
                    <option value="agendada">Agendada</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Observações</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={editingConsulta.observacoes || ''}
                    onChange={(e) => setEditingConsulta({ ...editingConsulta, observacoes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBloqueioModal && (
        <div className="modal-overlay" onClick={() => setShowBloqueioModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaLock /> Bloquear Agenda</h2>
              <button className="modal-close" onClick={() => setShowBloqueioModal(false)}>×</button>
            </div>
            <form onSubmit={handleSalvarBloqueio}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Tipo de Bloqueio *</label>
                  <select
                    className="input"
                    value={bloqueioData.tipo}
                    onChange={(e) => setBloqueioData({ ...bloqueioData, tipo: e.target.value })}
                  >
                    <option value="dia_inteiro">Dia Inteiro</option>
                    <option value="horario">Horários Específicos</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Data Início *</label>
                  <input
                    type="date"
                    className="input"
                    value={bloqueioData.data_inicio}
                    onChange={(e) => setBloqueioData({ ...bloqueioData, data_inicio: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Data Fim *</label>
                  <input
                    type="date"
                    className="input"
                    value={bloqueioData.data_fim}
                    onChange={(e) => setBloqueioData({ ...bloqueioData, data_fim: e.target.value })}
                    required
                  />
                </div>

                {bloqueioData.tipo === 'horario' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label">Horário Início *</label>
                      <input
                        type="time"
                        className="input"
                        value={bloqueioData.horario_inicio}
                        onChange={(e) => setBloqueioData({ ...bloqueioData, horario_inicio: e.target.value })}
                        required={bloqueioData.tipo === 'horario'}
                      />
                    </div>

                    <div className="form-group">
                      <label className="label">Horário Fim *</label>
                      <input
                        type="time"
                        className="input"
                        value={bloqueioData.horario_fim}
                        onChange={(e) => setBloqueioData({ ...bloqueioData, horario_fim: e.target.value })}
                        required={bloqueioData.tipo === 'horario'}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="label">Motivo</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={bloqueioData.motivo}
                    onChange={(e) => setBloqueioData({ ...bloqueioData, motivo: e.target.value })}
                    placeholder="Ex: Férias, Folga, Congresso, Almoço..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBloqueioModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaLock /> Bloquear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
