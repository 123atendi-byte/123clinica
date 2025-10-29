const express = require('express');
const router = express.Router();
const db = require('../database');

// Função auxiliar para gerar código de consulta único (4-6 dígitos)
function gerarCodigoConsulta() {
  const min = 1000; // 4 dígitos
  const max = 999999; // 6 dígitos
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função auxiliar para gerar horários
function gerarHorarios(inicio, fim, intervalo = 30) {
  const horarios = [];
  const [horaInicio, minInicio] = inicio.split(':').map(Number);
  const [horaFim, minFim] = fim.split(':').map(Number);

  let horaAtual = horaInicio;
  let minAtual = minInicio;

  while (horaAtual < horaFim || (horaAtual === horaFim && minAtual < minFim)) {
    const horarioStr = `${String(horaAtual).padStart(2, '0')}:${String(minAtual).padStart(2, '0')}`;
    horarios.push(horarioStr);

    minAtual += intervalo;
    if (minAtual >= 60) {
      horaAtual += Math.floor(minAtual / 60);
      minAtual = minAtual % 60;
    }
  }

  return horarios;
}

// GET /api/agenda/horarios-livres - Retornar horários disponíveis
router.get('/horarios-livres', (req, res) => {
  const { medico_id, data } = req.query;

  if (!medico_id || !data) {
    return res.status(400).json({ error: 'medico_id e data são obrigatórios' });
  }

  // Descobrir o dia da semana da data (0=domingo, 1=segunda, ..., 6=sábado)
  // Usar UTC para evitar problemas de timezone
  const [ano, mes, dia] = data.split('-').map(Number);
  const dataObj = new Date(Date.UTC(ano, mes - 1, dia));
  const diaSemana = dataObj.getUTCDay();

  // Buscar agenda do médico para este dia da semana
  db.all(
    'SELECT * FROM agenda_medicos WHERE medico_id = ? AND dia_semana = ? AND ativo = 1',
    [medico_id, diaSemana],
    (err, agendas) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar agenda do médico' });
      }

      if (!agendas || agendas.length === 0) {
        return res.json({
          data,
          medico_id: parseInt(medico_id),
          horarios_livres: [],
          total_disponiveis: 0,
          mensagem: 'Médico não atende neste dia da semana'
        });
      }

      // Verificar se há bloqueio DIA INTEIRO para esta data
      // Bloqueio dia inteiro = quando horario_inicio e horario_fim são NULL
      db.get(
        `SELECT * FROM bloqueios_agenda
         WHERE medico_id = ? AND ? BETWEEN data_inicio AND data_fim
         AND horario_inicio IS NULL AND horario_fim IS NULL`,
        [medico_id, data],
        (err, bloqueio) => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao verificar bloqueios' });
          }

          if (bloqueio) {
            // Bloqueio dia inteiro - bloqueia tudo
            return res.json({
              data,
              medico_id: parseInt(medico_id),
              horarios_livres: [],
              total_disponiveis: 0,
              bloqueado: true,
              motivo: bloqueio.motivo || 'Agenda bloqueada'
            });
          }

          // Gerar todos os horários disponíveis baseados na agenda
          let horariosDisponiveis = [];
          agendas.forEach(agenda => {
            const horarios = gerarHorarios(
              agenda.horario_inicio,
              agenda.horario_fim,
              agenda.intervalo_minutos
            );
            horariosDisponiveis = [...horariosDisponiveis, ...horarios];
          });

          // Buscar bloqueios por horário para esta data
          db.all(
            `SELECT horario_inicio, horario_fim FROM bloqueios_agenda
             WHERE medico_id = ? AND ? BETWEEN data_inicio AND data_fim
             AND horario_inicio IS NOT NULL AND horario_fim IS NOT NULL`,
            [medico_id, data],
            (err, bloqueiosHorario) => {
              if (err) {
                return res.status(500).json({ error: 'Erro ao verificar bloqueios de horário' });
              }

              // Buscar horários já agendados para o médico na data especificada
              db.all(
                'SELECT horario FROM consultas WHERE medico_id = ? AND data_consulta = ? AND status != ?',
                [medico_id, data, 'cancelada'],
                (err, rows) => {
                  if (err) {
                    return res.status(500).json({ error: 'Erro ao buscar horários' });
                  }

                  const horariosOcupados = rows.map(row => row.horario);

                  // Filtrar horários bloqueados
                  let horariosLivres = horariosDisponiveis.filter(horario => {
                    // Verificar se está ocupado
                    if (horariosOcupados.includes(horario)) return false;

                    // Verificar se está em bloqueio de horário
                    for (const bloq of bloqueiosHorario) {
                      if (horario >= bloq.horario_inicio && horario < bloq.horario_fim) {
                        return false;
                      }
                    }

                    return true;
                  });

                  res.json({
                    data,
                    medico_id: parseInt(medico_id),
                    dia_semana: diaSemana,
                    horarios_livres: horariosLivres,
                    total_disponiveis: horariosLivres.length,
                    bloqueado: false,
                    bloqueios_horario: bloqueiosHorario.length
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// POST /api/agenda - Agendar uma consulta
router.post('/', (req, res) => {
  const { paciente_id, medico_id, data_consulta, horario, observacoes } = req.body;

  if (!paciente_id || !medico_id || !data_consulta || !horario) {
    return res.status(400).json({
      error: 'paciente_id, medico_id, data_consulta e horario são obrigatórios'
    });
  }

  // Descobrir o dia da semana
  const [ano, mes, dia] = data_consulta.split('-').map(Number);
  const dataObj = new Date(Date.UTC(ano, mes - 1, dia));
  const diaSemana = dataObj.getUTCDay();

  // Verificar se médico tem agenda configurada para este dia
  db.get(
    'SELECT * FROM agenda_medicos WHERE medico_id = ? AND dia_semana = ? AND ativo = 1',
    [medico_id, diaSemana],
    (err, agenda) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao verificar agenda do médico' });
      }

      if (!agenda) {
        return res.status(400).json({
          error: 'Médico não atende neste dia da semana. Por favor, configure a agenda do médico primeiro.'
        });
      }

      // Gerar horários disponíveis para validar se o horário solicitado existe
      const horariosDisponiveis = gerarHorarios(
        agenda.horario_inicio,
        agenda.horario_fim,
        agenda.intervalo_minutos
      );

      if (!horariosDisponiveis.includes(horario)) {
        return res.status(400).json({
          error: `Horário ${horario} não está disponível na agenda do médico. Horários disponíveis: ${agenda.horario_inicio} às ${agenda.horario_fim}`
        });
      }

      // Verificar se há bloqueio DIA INTEIRO para esta data
      db.get(
        `SELECT * FROM bloqueios_agenda
         WHERE medico_id = ? AND ? BETWEEN data_inicio AND data_fim
         AND horario_inicio IS NULL AND horario_fim IS NULL`,
        [medico_id, data_consulta],
        (err, bloqueio) => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao verificar bloqueios' });
          }

          if (bloqueio) {
            return res.status(400).json({
              error: `Agenda bloqueada: ${bloqueio.motivo || 'Médico não disponível nesta data'}`
            });
          }

          // Verificar se o horário específico está em um bloqueio de horário
          db.get(
            `SELECT * FROM bloqueios_agenda
             WHERE medico_id = ? AND ? BETWEEN data_inicio AND data_fim
             AND horario_inicio IS NOT NULL AND horario_fim IS NOT NULL
             AND ? >= horario_inicio AND ? < horario_fim`,
            [medico_id, data_consulta, horario, horario],
            (err, bloqueioHorario) => {
              if (err) {
                return res.status(500).json({ error: 'Erro ao verificar bloqueios de horário' });
              }

              if (bloqueioHorario) {
                return res.status(400).json({
                  error: `Horário bloqueado: ${bloqueioHorario.motivo || 'Este horário está bloqueado'}`
                });
              }

              // Verificar se o horário está disponível
              db.get(
                'SELECT * FROM consultas WHERE medico_id = ? AND data_consulta = ? AND horario = ? AND status != ?',
                [medico_id, data_consulta, horario, 'cancelada'],
                (err, row) => {
              if (err) {
                return res.status(500).json({ error: 'Erro ao verificar disponibilidade' });
              }

              if (row) {
                return res.status(400).json({ error: 'Horário já está ocupado para este médico' });
              }

              // Gerar código de consulta único
              const tentarInserir = (tentativas = 0) => {
                if (tentativas > 10) {
                  return res.status(500).json({ error: 'Erro ao gerar código de consulta único' });
                }

                const codigoConsulta = gerarCodigoConsulta();

                // Agendar a consulta
                db.run(
                  `INSERT INTO consultas (codigo_consulta, paciente_id, medico_id, data_consulta, horario, observacoes, status)
                   VALUES (?, ?, ?, ?, ?, ?, 'agendada')`,
                  [codigoConsulta, paciente_id, medico_id, data_consulta, horario, observacoes],
                  function (err) {
                    if (err) {
                      // Se o código já existe, tentar novamente
                      if (err.message.includes('UNIQUE')) {
                        return tentarInserir(tentativas + 1);
                      }
                      return res.status(500).json({ error: 'Erro ao agendar consulta' });
                    }
                    res.status(201).json({
                      message: 'Consulta agendada com sucesso',
                      id: this.lastID,
                      codigo_consulta: codigoConsulta
                    });
                  }
                );
              };

              tentarInserir();
                }
              );
            }
          );
        }
      );
    }
  );
});

// GET /api/agenda - Listar consultas agendadas
router.get('/', (req, res) => {
  const { data_inicio, data_fim, medico_id, paciente_id, status } = req.query;

  let query = `
    SELECT
      c.id,
      c.data_consulta,
      c.horario,
      c.status,
      c.observacoes,
      c.created_at,
      p.id as paciente_id,
      p.nome as paciente_nome,
      p.telefone as paciente_telefone,
      m.id as medico_id,
      m.nome as medico_nome,
      m.especialidade as medico_especialidade
    FROM consultas c
    JOIN pacientes p ON c.paciente_id = p.id
    JOIN medicos m ON c.medico_id = m.id
    WHERE 1=1
  `;

  const params = [];

  if (data_inicio) {
    query += ' AND c.data_consulta >= ?';
    params.push(data_inicio);
  }

  if (data_fim) {
    query += ' AND c.data_consulta <= ?';
    params.push(data_fim);
  }

  if (medico_id) {
    query += ' AND c.medico_id = ?';
    params.push(medico_id);
  }

  if (paciente_id) {
    query += ' AND c.paciente_id = ?';
    params.push(paciente_id);
  }

  if (status) {
    query += ' AND c.status = ?';
    params.push(status);
  }

  query += ' ORDER BY c.data_consulta, c.horario';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar consultas' });
    }

    const consultas = rows.map(row => ({
      id: row.id,
      codigo_consulta: row.codigo_consulta,
      data_consulta: row.data_consulta,
      horario: row.horario,
      status: row.status,
      observacoes: row.observacoes,
      created_at: row.created_at,
      paciente: {
        id: row.paciente_id,
        nome: row.paciente_nome,
        telefone: row.paciente_telefone
      },
      medico: {
        id: row.medico_id,
        nome: row.medico_nome,
        especialidade: row.medico_especialidade
      }
    }));

    res.json(consultas);
  });
});

// PUT /api/agenda/:id - Atualizar status da consulta
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status, observacoes } = req.body;

  db.run(
    'UPDATE consultas SET status = ?, observacoes = ? WHERE id = ?',
    [status, observacoes, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar consulta' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Consulta não encontrada' });
      }
      res.json({ message: 'Consulta atualizada com sucesso' });
    }
  );
});

// PATCH /api/agenda/:id/cancelar - Cancelar consulta (soft delete)
router.patch('/:id/cancelar', (req, res) => {
  const { id } = req.params;

  db.run(
    "UPDATE consultas SET status = 'cancelada' WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao cancelar consulta' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Consulta não encontrada' });
      }
      res.json({ message: 'Consulta cancelada com sucesso' });
    }
  );
});

// DELETE /api/agenda/:id - Deletar consulta permanentemente
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM consultas WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar consulta' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }
    res.json({ message: 'Consulta deletada permanentemente com sucesso' });
  });
});

// GET /api/agenda/datas-disponiveis - Buscar datas disponíveis em um intervalo
router.get('/datas-disponiveis', (req, res) => {
  const { medico_id, data_inicio, data_fim } = req.query;

  if (!medico_id || !data_inicio || !data_fim) {
    return res.status(400).json({
      error: 'medico_id, data_inicio e data_fim são obrigatórios'
    });
  }

  // Buscar agenda do médico
  db.all(
    'SELECT * FROM agenda_medicos WHERE medico_id = ? AND ativo = 1',
    [medico_id],
    (err, agendas) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar agenda do médico' });
      }

      if (!agendas || agendas.length === 0) {
        return res.json({
          medico_id: parseInt(medico_id),
          datas_disponiveis: [],
          mensagem: 'Médico não possui agenda configurada'
        });
      }

      // Gerar lista de datas no intervalo
      const inicio = new Date(data_inicio + 'T00:00:00Z');
      const fim = new Date(data_fim + 'T00:00:00Z');
      const datasParaVerificar = [];

      for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
        const dataStr = d.toISOString().split('T')[0];
        const diaSemana = d.getUTCDay();

        // Verificar se o médico atende neste dia da semana
        const atendeNesteDia = agendas.some(a => a.dia_semana === diaSemana);

        if (atendeNesteDia) {
          datasParaVerificar.push({ data: dataStr, dia_semana: diaSemana });
        }
      }

      // Buscar horários ocupados para todas as datas
      const datasList = datasParaVerificar.map(d => d.data);
      const placeholders = datasList.map(() => '?').join(',');

      db.all(
        `SELECT data_consulta, COUNT(*) as total_ocupados
         FROM consultas
         WHERE medico_id = ? AND data_consulta IN (${placeholders}) AND status != 'cancelada'
         GROUP BY data_consulta`,
        [medico_id, ...datasList],
        (err, ocupados) => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao verificar disponibilidade' });
          }

          const ocupadosMap = {};
          ocupados.forEach(o => {
            ocupadosMap[o.data_consulta] = o.total_ocupados;
          });

          // Calcular disponibilidade para cada data
          const datasDisponiveis = datasParaVerificar.map(item => {
            const agenda = agendas.find(a => a.dia_semana === item.dia_semana);
            if (!agenda) return null;

            const totalHorarios = gerarHorarios(
              agenda.horario_inicio,
              agenda.horario_fim,
              agenda.intervalo_minutos
            ).length;

            const ocupados = ocupadosMap[item.data] || 0;
            const disponiveis = totalHorarios - ocupados;

            return {
              data: item.data,
              dia_semana: item.dia_semana,
              horarios_disponiveis: disponiveis,
              horarios_total: totalHorarios,
              tem_disponibilidade: disponiveis > 0
            };
          }).filter(d => d && d.tem_disponibilidade);

          res.json({
            medico_id: parseInt(medico_id),
            periodo: { data_inicio, data_fim },
            datas_disponiveis: datasDisponiveis,
            total_datas: datasDisponiveis.length
          });
        }
      );
    }
  );
});

module.exports = router;
