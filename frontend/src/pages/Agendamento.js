import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { pacientesService, medicosService, agendaService } from '../services/api';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import 'react-calendar/dist/Calendar.css';
import './Agendamento.css';

const Agendamento = () => {
  const [date, setDate] = useState(new Date());
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [horariosLivres, setHorariosLivres] = useState([]);
  const [formData, setFormData] = useState({
    paciente_id: '',
    medico_id: '',
    horario: '',
    observacoes: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Função para formatar data sem problemas de timezone
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    loadPacientes();
    loadMedicos();
  }, []);

  useEffect(() => {
    if (formData.medico_id) {
      loadHorariosLivres();
    }
  }, [formData.medico_id, date]);

  const loadPacientes = async () => {
    try {
      const response = await pacientesService.getAll();
      setPacientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const loadMedicos = async () => {
    try {
      const response = await medicosService.getAll();
      setMedicos(response.data);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
    }
  };

  const loadHorariosLivres = async () => {
    try {
      const dataFormatada = formatDateLocal(date);
      const response = await agendaService.getHorariosLivres(formData.medico_id, dataFormatada);
      setHorariosLivres(response.data.horarios_livres);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setHorariosLivres([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const dataFormatada = formatDateLocal(date);
      await agendaService.agendar({
        ...formData,
        data_consulta: dataFormatada,
      });

      setMessage({ type: 'success', text: 'Consulta agendada com sucesso!' });
      setFormData({
        paciente_id: '',
        medico_id: '',
        horario: '',
        observacoes: '',
      });
      setDate(new Date());
      setHorariosLivres([]);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Erro ao agendar consulta',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agendamento">
      <h1>Agendar Consulta</h1>

      {message.text && (
        <div className={message.type === 'success' ? 'success' : 'error'}>
          {message.text}
        </div>
      )}

      <div className="agendamento-container">
        <div className="card calendar-card">
          <h2>
            <FaCalendarAlt /> Selecione a Data
          </h2>
          <Calendar
            onChange={setDate}
            value={date}
            minDate={new Date()}
            locale="pt-BR"
          />
          <div className="selected-date">
            Data selecionada: <strong>{date.toLocaleDateString('pt-BR')}</strong>
          </div>
        </div>

        <div className="card form-card">
          <h2>Dados da Consulta</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Paciente *</label>
              <select
                className="input"
                value={formData.paciente_id}
                onChange={(e) => setFormData({ ...formData, paciente_id: e.target.value })}
                required
              >
                <option value="">Selecione um paciente</option>
                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.nome} - {paciente.cpf}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Médico *</label>
              <select
                className="input"
                value={formData.medico_id}
                onChange={(e) => setFormData({ ...formData, medico_id: e.target.value, horario: '' })}
                required
              >
                <option value="">Selecione um médico</option>
                {medicos.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    Dr(a). {medico.nome} - {medico.especialidade}
                  </option>
                ))}
              </select>
            </div>

            {formData.medico_id && (
              <div className="form-group">
                <label className="label">
                  <FaClock /> Horário Disponível *
                </label>
                {horariosLivres.length === 0 ? (
                  <p className="no-horarios">Nenhum horário disponível para esta data</p>
                ) : (
                  <div className="horarios-grid">
                    {horariosLivres.map((horario) => (
                      <label key={horario} className="horario-option">
                        <input
                          type="radio"
                          name="horario"
                          value={horario}
                          checked={formData.horario === horario}
                          onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                          required
                        />
                        <span>{horario}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="label">Observações</label>
              <textarea
                className="input"
                rows="3"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre a consulta..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || !formData.paciente_id || !formData.medico_id || !formData.horario}
            >
              {loading ? 'Agendando...' : 'Agendar Consulta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Agendamento;
