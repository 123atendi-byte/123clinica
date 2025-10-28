const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/agenda-medicos - Listar todas as agendas (com informações dos médicos)
router.get('/', (req, res) => {
  db.all(
    `SELECT
      a.*,
      m.nome as medico_nome,
      m.especialidade as medico_especialidade
    FROM agenda_medicos a
    JOIN medicos m ON a.medico_id = m.id
    WHERE a.ativo = 1
    ORDER BY m.nome, a.dia_semana, a.horario_inicio`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar agendas' });
      }
      res.json(rows);
    }
  );
});

// GET /api/agenda-medicos/:medico_id - Buscar agenda de um médico
router.get('/:medico_id', (req, res) => {
  const { medico_id } = req.params;

  db.all(
    'SELECT * FROM agenda_medicos WHERE medico_id = ? AND ativo = 1 ORDER BY dia_semana, horario_inicio',
    [medico_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar agenda do médico' });
      }
      res.json(rows);
    }
  );
});

// POST /api/agenda-medicos - Criar horário na agenda
router.post('/', (req, res) => {
  const { medico_id, dia_semana, horario_inicio, horario_fim, intervalo_minutos } = req.body;

  if (!medico_id || dia_semana === undefined || !horario_inicio || !horario_fim) {
    return res.status(400).json({
      error: 'medico_id, dia_semana, horario_inicio e horario_fim são obrigatórios'
    });
  }

  // Validar dia da semana (0-6)
  if (dia_semana < 0 || dia_semana > 6) {
    return res.status(400).json({ error: 'dia_semana deve ser entre 0 (domingo) e 6 (sábado)' });
  }

  // Verificar se já existe agenda para este médico neste dia e horário
  db.get(
    `SELECT * FROM agenda_medicos
     WHERE medico_id = ? AND dia_semana = ? AND ativo = 1`,
    [medico_id, dia_semana],
    (err, existing) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao verificar agenda' });
      }

      if (existing) {
        return res.status(400).json({
          error: 'Já existe uma agenda cadastrada para este médico neste dia da semana'
        });
      }

      // Criar agenda
      db.run(
        `INSERT INTO agenda_medicos (medico_id, dia_semana, horario_inicio, horario_fim, intervalo_minutos)
         VALUES (?, ?, ?, ?, ?)`,
        [medico_id, dia_semana, horario_inicio, horario_fim, intervalo_minutos || 30],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Erro ao criar agenda' });
          }
          res.status(201).json({
            message: 'Agenda criada com sucesso',
            id: this.lastID
          });
        }
      );
    }
  );
});

// PUT /api/agenda-medicos/:id - Atualizar horário na agenda
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { dia_semana, horario_inicio, horario_fim, intervalo_minutos, ativo } = req.body;

  db.run(
    `UPDATE agenda_medicos
     SET dia_semana = ?, horario_inicio = ?, horario_fim = ?, intervalo_minutos = ?, ativo = ?
     WHERE id = ?`,
    [dia_semana, horario_inicio, horario_fim, intervalo_minutos, ativo, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar agenda' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Agenda não encontrada' });
      }
      res.json({ message: 'Agenda atualizada com sucesso' });
    }
  );
});

// DELETE /api/agenda-medicos/:id - Deletar horário da agenda
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM agenda_medicos WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar agenda' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Agenda não encontrada' });
    }
    res.json({ message: 'Agenda deletada com sucesso' });
  });
});

module.exports = router;
