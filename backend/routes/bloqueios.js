const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/bloqueios - Listar bloqueios (com filtros opcionais)
router.get('/', (req, res) => {
  const { medico_id, data_inicio, data_fim } = req.query;

  let query = `
    SELECT b.*, m.nome as medico_nome, m.especialidade
    FROM bloqueios_agenda b
    JOIN medicos m ON b.medico_id = m.id
    WHERE 1=1
  `;
  const params = [];

  if (medico_id) {
    query += ' AND b.medico_id = ?';
    params.push(medico_id);
  }

  if (data_inicio) {
    query += ' AND b.data_fim >= ?';
    params.push(data_inicio);
  }

  if (data_fim) {
    query += ' AND b.data_inicio <= ?';
    params.push(data_fim);
  }

  query += ' ORDER BY b.data_inicio';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar bloqueios' });
    }
    res.json(rows);
  });
});

// POST /api/bloqueios - Criar bloqueio
router.post('/', (req, res) => {
  const { medico_id, data_inicio, data_fim, horario_inicio, horario_fim, motivo } = req.body;

  if (!medico_id || !data_inicio || !data_fim) {
    return res.status(400).json({
      error: 'medico_id, data_inicio e data_fim são obrigatórios'
    });
  }

  // Validar que data_fim >= data_inicio
  if (data_fim < data_inicio) {
    return res.status(400).json({
      error: 'data_fim deve ser maior ou igual a data_inicio'
    });
  }

  // Se tem horário, validar que ambos estão presentes
  if ((horario_inicio && !horario_fim) || (!horario_inicio && horario_fim)) {
    return res.status(400).json({
      error: 'Se informar horário, deve informar horario_inicio e horario_fim'
    });
  }

  db.run(
    `INSERT INTO bloqueios_agenda (medico_id, data_inicio, data_fim, horario_inicio, horario_fim, motivo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [medico_id, data_inicio, data_fim, horario_inicio, horario_fim, motivo],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar bloqueio' });
      }
      res.status(201).json({
        message: 'Bloqueio criado com sucesso',
        id: this.lastID,
        tipo: horario_inicio ? 'horario' : 'dia_inteiro'
      });
    }
  );
});

// PUT /api/bloqueios/:id - Atualizar bloqueio
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { data_inicio, data_fim, motivo } = req.body;

  // Validar que data_fim >= data_inicio
  if (data_fim < data_inicio) {
    return res.status(400).json({
      error: 'data_fim deve ser maior ou igual a data_inicio'
    });
  }

  db.run(
    `UPDATE bloqueios_agenda
     SET data_inicio = ?, data_fim = ?, motivo = ?
     WHERE id = ?`,
    [data_inicio, data_fim, motivo, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar bloqueio' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Bloqueio não encontrado' });
      }
      res.json({ message: 'Bloqueio atualizado com sucesso' });
    }
  );
});

// DELETE /api/bloqueios/:id - Deletar bloqueio
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM bloqueios_agenda WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar bloqueio' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Bloqueio não encontrado' });
    }
    res.json({ message: 'Bloqueio deletado com sucesso' });
  });
});

module.exports = router;
