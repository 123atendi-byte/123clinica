const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/medicos - Listar todos os médicos
router.get('/', (req, res) => {
  db.all('SELECT * FROM medicos ORDER BY nome', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar médicos' });
    }
    res.json(rows);
  });
});

// GET /api/medicos/:id - Buscar médico por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM medicos WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar médico' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Médico não encontrado' });
    }
    res.json(row);
  });
});

// POST /api/medicos - Cadastrar novo médico
router.post('/', (req, res) => {
  const { nome, crm, especialidade, telefone, email } = req.body;

  if (!nome || !crm || !especialidade) {
    return res.status(400).json({ error: 'Nome, CRM e especialidade são obrigatórios' });
  }

  db.run(
    `INSERT INTO medicos (nome, crm, especialidade, telefone, email)
     VALUES (?, ?, ?, ?, ?)`,
    [nome, crm, especialidade, telefone, email],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'CRM já cadastrado' });
        }
        return res.status(500).json({ error: 'Erro ao cadastrar médico' });
      }
      res.status(201).json({
        message: 'Médico cadastrado com sucesso',
        id: this.lastID
      });
    }
  );
});

// PUT /api/medicos/:id - Atualizar médico
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, crm, especialidade, telefone, email } = req.body;

  db.run(
    `UPDATE medicos
     SET nome = ?, crm = ?, especialidade = ?, telefone = ?, email = ?
     WHERE id = ?`,
    [nome, crm, especialidade, telefone, email, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar médico' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Médico não encontrado' });
      }
      res.json({ message: 'Médico atualizado com sucesso' });
    }
  );
});

// DELETE /api/medicos/:id - Deletar médico
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM medicos WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar médico' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Médico não encontrado' });
    }
    res.json({ message: 'Médico deletado com sucesso' });
  });
});

module.exports = router;
