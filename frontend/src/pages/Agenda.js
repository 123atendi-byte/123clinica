import React, { useState, useEffect } from 'react';
import { agendaService, medicosService, bloqueiosService, pacientesService } from '../services/api';
import { FaCalendarAlt, FaEdit, FaTrash, FaClock, FaUser, FaChevronLeft, FaChevronRight, FaCalendarWeek, FaBan, FaLock, FaCalendar } from 'react-icons/fa';
import './Agenda.css';
import './AgendaBloqueios.css';

const Agenda = () => {
  const [medicos, setMedicos] = useState([]);
  const [selectedMedico, setSelectedMedico] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week' ou 'month'
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [consultasSemana, setConsultasSemana] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [horariosLivres, setHorariosLivres] = useState([]);
  const [horariosLivresSemana, setHorariosLivresSemana] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [bloqueiosSemana, setBloqueiosSemana] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBloqueioModal, setShowBloqueioModal] = useState(false);
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [editingConsulta, setEditingConsulta] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [novoAgendamento, setNovoAgendamento] = useState({
    paciente_id: '',
    observacoes: ''
  });
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
    loadPacientes();
  }, []);

  useEffect(() => {
    if (selectedMedico) {
      if (viewMode === 'month') {
        loadAgendaMes();
      } else if (viewMode === 'week') {
        loadAgendaSemana();
        loadHorariosLivresSemana();
        loadBloqueiosSemana();
      } else {
        loadAgendaDia();
        loadHorariosLivres();
      }
    }
  }, [selectedMedico, selectedDate, weekStart, currentMonth, viewMode]);

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

  const loadPacientes = async () => {
    try {
      const response = await pacientesService.getAll();
      const data = Array.isArray(response.data) ? response.data : [];
      setPacientes(data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      setPacientes([]);
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
      const bloqueios = Array.isArray(response.data) ? response.data : [];
      setBloqueiosSemana(bloqueios);
    } catch (error) {
      console.error('Erro ao carregar bloqueios:', error);
      setBloqueiosSemana([]);
    }
  };

  // Verifica se um horário específico está bloqueado
  const isHorarioBloqueado = (dateStr, horario) => {
    return bloqueiosSemana.some(bloqueio => {
      const dentroData = dateStr >= bloqueio.data_inicio && dateStr <= bloqueio.data_fim;

      if (!dentroData) return false;

      // Se não tem horário específico, bloqueia o dia inteiro
      if (!bloqueio.horario_inicio || !bloqueio.horario_fim) {
        return true;
      }

      // Se tem horário específico, verifica se o horário está no intervalo
      return horario >= bloqueio.horario_inicio && horario <= bloqueio.horario_fim;
    });
  };

  // Busca bloqueio em um horário específico
  const getBloqueioNoHorario = (dateStr, horario) => {
    return bloqueiosSemana.find(bloqueio => {
      const dentroData = dateStr >= bloqueio.data_inicio && dateStr <= bloqueio.data_fim;

      if (!dentroData) return false;

      // Se não tem horário específico, bloqueia o dia inteiro
      if (!bloqueio.horario_inicio || !bloqueio.horario_fim) {
        return true;
      }

      // Se tem horário específico, verifica se o horário está no intervalo
      return horario >= bloqueio.horario_inicio && horario <= bloqueio.horario_fim;
    });
  };

  const loadAgendaMes = async () => {
    setLoading(true);
    try {
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const dataInicio = formatDate(firstDay);
      const dataFim = formatDate(lastDay);

      const response = await agendaService.getConsultas({
        medico_id: selectedMedico,
        data_inicio: dataInicio,
        data_fim: dataFim,
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setConsultasSemana(data); // Reutilizando consultasSemana para o mês
    } catch (error) {
      console.error('Erro ao carregar consultas do mês:', error);
      setConsultasSemana([]);
    } finally {
      setLoading(false);
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

  const handleSlotClick = (date, horario, consulta = null) => {
    setSelectedSlot({ date, horario, consulta });
    if (consulta) {
      setEditingConsulta(consulta);
      setShowEditModal(true);
    } else {
      setNovoAgendamento({
        paciente_id: '',
        observacoes: ''
      });
      setShowAgendamentoModal(true);
    }
  };

  const handleCriarAgendamento = async (e) => {
    e.preventDefault();
    if (!novoAgendamento.paciente_id) {
      alert('Por favor, selecione um paciente');
      return;
    }

    try {
      await agendaService.agendar({
        medico_id: selectedMedico,
        paciente_id: novoAgendamento.paciente_id,
        data_consulta: selectedSlot.date,
        horario: selectedSlot.horario,
        observacoes: novoAgendamento.observacoes
      });

      setShowAgendamentoModal(false);
      setNovoAgendamento({ paciente_id: '', observacoes: '' });

      // Recarrega a agenda
      if (viewMode === 'week') {
        loadAgendaSemana();
        loadHorariosLivresSemana();
      } else {
        loadAgendaDia();
        loadHorariosLivres();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao criar agendamento');
    }
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

  const handleCriarBloqueio = (dateStr = null) => {
    const dataInicial = dateStr || formatDate(weekStart);
    setBloqueioData({
      data_inicio: dataInicial,
      data_fim: dataInicial,
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

  const handleRemoverBloqueio = async (bloqueioId, bloqueioDescricao) => {
    if (window.confirm(`Tem certeza que deseja remover o bloqueio: ${bloqueioDescricao || 'Sem motivo'}?`)) {
      try {
        await bloqueiosService.delete(bloqueioId);
        loadBloqueiosSemana();
        loadHorariosLivresSemana();
        loadAgendaSemana();
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
    setCurrentMonth(new Date());
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Dias do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Dias do próximo mês
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const getMonthYearString = () => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
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
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    return days[new Date(date).getDay()];
  };

  // Função para gerar avatar com inicial do nome
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  // Cores de avatar baseadas em hash do nome
  const getAvatarColor = (name) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Horários padrão (podem ser personalizados)
  const getHorariosPadrao = () => {
    const horarios = [];
    for (let h = 8; h <= 18; h++) {
      horarios.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < 18) {
        horarios.push(`${h.toString().padStart(2, '0')}:30`);
      }
    }
    return horarios;
  };

  // Retorna TODOS os horários da agenda do médico (baseado na configuração de agenda)
  const getHorariosVisiveis = () => {
    const allHorarios = getHorariosPadrao();
    const horariosComAgenda = new Set();

    // Para cada dia da semana, adiciona os horários da agenda configurada
    getDaysOfWeek().forEach(day => {
      const dateStr = formatDate(day);
      const horariosInfo = horariosLivresSemana[dateStr];

      // Se tem agenda configurada (horários_livres existe), adiciona TODOS os possíveis horários
      // Isso inclui horários livres + horários ocupados (consultas serão mostradas sobre eles)
      if (horariosInfo && !horariosInfo.mensagem) {
        // Adiciona todos os horários do dia baseado na agenda
        allHorarios.forEach(h => horariosComAgenda.add(h));
      }
    });

    // Também adiciona horários que têm consultas (para garantir que apareçam)
    consultasSemana.forEach(consulta => {
      horariosComAgenda.add(consulta.horario);
    });

    // Se não houver nenhum horário, mostra horários padrão de trabalho
    if (horariosComAgenda.size === 0) {
      return allHorarios.filter(h => {
        const hora = parseInt(h.split(':')[0]);
        return hora >= 8 && hora <= 18;
      });
    }

    // Retorna todos os horários que fazem parte da agenda
    return allHorarios.filter(h => horariosComAgenda.has(h));
  };

  const medicoSelecionado = medicos.find(m => m.id === selectedMedico);

  return (
    <div className="agenda">
      <div className="page-header-compact">
        <h1><FaCalendarAlt /> Agenda de Consultas</h1>
        <div className="header-controls">
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
            <button
              className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('month')}
            >
              <FaCalendar /> Mês
            </button>
          </div>

          <div className="medico-filter-compact">
            <label className="filter-label"><FaUser /> Médico:</label>
            <select
              className="input-compact"
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
            <div className="date-filter-compact">
              <label className="filter-label">Data:</label>
              <input
                type="date"
                className="input-compact"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="month-view">
          <div className="month-header">
            <button className="btn btn-secondary" onClick={handlePreviousMonth}>
              <FaChevronLeft /> Mês Anterior
            </button>
            <div className="month-title">{getMonthYearString()}</div>
            <button className="btn btn-secondary" onClick={handleNextMonth}>
              Próximo Mês <FaChevronRight />
            </button>
          </div>

          <div className="month-grid">
            <div className="month-grid-header">
              <div className="month-day-header">Dom</div>
              <div className="month-day-header">Seg</div>
              <div className="month-day-header">Ter</div>
              <div className="month-day-header">Qua</div>
              <div className="month-day-header">Qui</div>
              <div className="month-day-header">Sex</div>
              <div className="month-day-header">Sáb</div>
            </div>

            {getDaysInMonth().map((day, index) => {
              const consultasDia = getConsultasPorDia(day.date);
              const isToday = formatDate(day.date) === formatDate(new Date());

              return (
                <div
                  key={index}
                  className={`month-day-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                >
                  <div className="month-day-number">{day.date.getDate()}</div>
                  <div className="month-day-consultas">
                    {consultasDia.slice(0, 3).map((consulta) => (
                      <div
                        key={consulta.id}
                        className={`month-consulta-dot ${consulta.status}`}
                        onClick={() => handleEdit(consulta)}
                        title={`${consulta.horario} - ${consulta.paciente.nome}`}
                      >
                        {consulta.horario} {consulta.paciente.nome}
                      </div>
                    ))}
                    {consultasDia.length > 3 && (
                      <div className="month-day-count">
                        +{consultasDia.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'week' ? (
        <div className="week-view-modern">
          <div className="week-header-modern">
            <div className="week-title-modern">
              <h2>Agenda Semanal</h2>
              <span className="week-range">
                {getDaysOfWeek()[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} a {' '}
                {getDaysOfWeek()[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="week-navigation-modern">
              <button className="btn btn-icon" onClick={handlePreviousWeek} title="Semana anterior">
                <FaChevronLeft />
              </button>
              <button className="btn btn-secondary" onClick={handleToday}>
                Hoje
              </button>
              <button className="btn btn-icon" onClick={handleNextWeek} title="Próxima semana">
                <FaChevronRight />
              </button>
              <button className="btn btn-primary" onClick={() => handleCriarBloqueio()} title="Adicionar bloqueio">
                <FaLock /> Bloqueio
              </button>
            </div>
          </div>

          <div className="week-grid-modern">
            {/* Cabeçalho com os dias da semana */}
            <div className="week-days-header">
              <div className="time-column-header"></div>
              {getDaysOfWeek().map((day, index) => {
                const isToday = formatDate(day) === formatDate(new Date());
                const dateStr = formatDate(day);
                const consultasDia = getConsultasPorDia(day);
                const horariosInfo = horariosLivresSemana[dateStr];

                // Verificar se há bloqueios neste dia
                const bloqueiosNesteDia = bloqueiosSemana.filter(b =>
                  dateStr >= b.data_inicio && dateStr <= b.data_fim
                );

                return (
                  <div key={index} className={`day-header-modern ${isToday ? 'today' : ''}`}>
                    <div className="day-name-modern">{getDayName(day)}, {new Date(day).getDate()}/{new Date(day).getMonth() + 1}/{new Date(day).getFullYear()}</div>
                    <div className="day-subtitle-modern">
                      {horariosInfo?.mensagem ? (
                        <span className="status-sem-agenda">Sem agenda</span>
                      ) : (
                        <>
                          <span className="status-disponivel">{consultasDia.length} consulta{consultasDia.length !== 1 ? 's' : ''}</span>
                          {bloqueiosNesteDia.length > 0 && (
                            <div className="bloqueios-dia-info">
                              {bloqueiosNesteDia.map(bloq => (
                                <div
                                  key={bloq.id}
                                  className="bloqueio-badge"
                                  title={`Bloqueio: ${bloq.motivo || 'Sem motivo'}\n${bloq.horario_inicio ? `${bloq.horario_inicio} - ${bloq.horario_fim}` : 'Dia inteiro'}\nClique para remover`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoverBloqueio(bloq.id, bloq.motivo);
                                  }}
                                >
                                  <FaLock size={8} />
                                  <span className="bloqueio-badge-text">
                                    {bloq.horario_inicio ? `${bloq.horario_inicio.substring(0,5)}-${bloq.horario_fim.substring(0,5)}` : 'Dia'}
                                  </span>
                                  <span className="bloqueio-badge-remove">✕</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grade de horários */}
            <div className="week-schedule-grid">
              {getHorariosVisiveis().map((horario) => (
                <div key={horario} className="time-row">
                  <div className="time-label">{horario}</div>
                  {getDaysOfWeek().map((day, dayIndex) => {
                    const dateStr = formatDate(day);
                    const horariosInfo = horariosLivresSemana[dateStr];
                    const consultasNoHorario = getConsultasPorDia(day).filter(c => c.horario === horario);
                    const isToday = formatDate(day) === formatDate(new Date());

                    const bloqueadoEsteHorario = isHorarioBloqueado(dateStr, horario);
                    const bloqueioNeste = getBloqueioNoHorario(dateStr, horario);

                    return (
                      <div
                        key={`${dateStr}-${horario}`}
                        className={`time-slot ${isToday ? 'today' : ''}`}
                        onClick={() => {
                          if (!bloqueadoEsteHorario && !horariosInfo?.mensagem) {
                            if (consultasNoHorario.length > 0) {
                              handleSlotClick(dateStr, horario, consultasNoHorario[0]);
                            } else if (horariosInfo?.horarios_livres?.includes(horario)) {
                              handleSlotClick(dateStr, horario);
                            }
                          }
                        }}
                      >
                        {/* PRIORIDADE 1: Consultas marcadas sempre aparecem */}
                        {consultasNoHorario.length > 0 ? (
                          consultasNoHorario.map((consulta) => (
                            <div
                              key={consulta.id}
                              className={`consulta-slot ${consulta.status}`}
                              title={`${consulta.paciente.nome} - ${getStatusLabel(consulta.status)}`}
                            >
                              <div
                                className="consulta-avatar"
                                style={{ backgroundColor: getAvatarColor(consulta.paciente.nome) }}
                              >
                                {getInitials(consulta.paciente.nome)}
                              </div>
                              <div className="consulta-info-slot">
                                <div className="consulta-name">{consulta.paciente.nome}</div>
                                <div className="consulta-details">
                                  {consulta.status === 'cancelada' && <FaBan size={10} />}
                                  {consulta.observacoes && <span title={consulta.observacoes}>📝</span>}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : bloqueadoEsteHorario ? (
                          /* PRIORIDADE 2: Horários bloqueados (sem consulta) */
                          <div
                            className="slot-bloqueado"
                            title={`Bloqueado: ${bloqueioNeste?.motivo || 'Sem motivo'} - Clique para remover`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (bloqueioNeste?.id) {
                                handleRemoverBloqueio(bloqueioNeste.id, bloqueioNeste.motivo);
                              }
                            }}
                          >
                            <FaLock size={12} />
                            <span className="bloqueio-remover-hint">✕</span>
                          </div>
                        ) : horariosInfo?.mensagem ? (
                          /* PRIORIDADE 3: Sem agenda configurada */
                          <div className="slot-sem-agenda">-</div>
                        ) : horariosInfo?.horarios_livres?.includes(horario) ? (
                          /* PRIORIDADE 4: Horários disponíveis */
                          <div className="slot-livre" title="Horário disponível - Clique para agendar">
                            <div className="slot-livre-indicator"></div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legenda */}
          <div className="week-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#22c55e' }}></div>
              <span>Agendada</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
              <span>Confirmada</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
              <span>Realizada</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
              <span>Cancelada</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon"><FaLock size={12} /></div>
              <span>Bloqueado</span>
            </div>
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
                <div className="modal-footer-left">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      setShowEditModal(false);
                      handleDelete(editingConsulta.id);
                    }}
                    title="Deletar permanentemente"
                  >
                    <FaTrash /> Deletar
                  </button>
                </div>
                <div className="modal-footer-right">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAgendamentoModal && selectedSlot && (
        <div className="modal-overlay" onClick={() => setShowAgendamentoModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaCalendarAlt /> Novo Agendamento</h2>
              <button className="modal-close" onClick={() => setShowAgendamentoModal(false)}>×</button>
            </div>
            <form onSubmit={handleCriarAgendamento}>
              <div className="modal-body">
                <div className="detail-group">
                  <strong>Data:</strong>
                  <span>{new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="detail-group">
                  <strong>Horário:</strong>
                  <span>{selectedSlot.horario}</span>
                </div>
                <div className="detail-group">
                  <strong>Médico:</strong>
                  <span>Dr(a). {medicoSelecionado?.nome}</span>
                </div>

                <div className="form-group">
                  <label className="label">Paciente *</label>
                  <select
                    className="input"
                    value={novoAgendamento.paciente_id}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, paciente_id: e.target.value })}
                    required
                  >
                    <option value="">Selecione um paciente</option>
                    {pacientes.map((paciente) => (
                      <option key={paciente.id} value={paciente.id}>
                        {paciente.nome} - {paciente.telefone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Observações</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={novoAgendamento.observacoes}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, observacoes: e.target.value })}
                    placeholder="Informações adicionais sobre a consulta..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAgendamentoModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaCalendarAlt /> Agendar
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
