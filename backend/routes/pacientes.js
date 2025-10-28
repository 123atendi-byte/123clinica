const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/pacientes/search - Buscar paciente por CPF, nome ou ID
router.get('/search', (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Parâmetro de busca "q" é obrigatório' });
  }

  // Buscar por ID (se for número), CPF ou nome
  const query = `
    SELECT * FROM pacientes
    WHERE id = ? OR cpf LIKE ? OR nome LIKE ?
    ORDER BY nome
  `;

  const searchTerm = `%${q}%`;
  const searchId = isNaN(q) ? -1 : parseInt(q);

  db.all(query, [searchId, searchTerm, searchTerm], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar pacientes' });
    }
    res.json({
      termo_busca: q,
      total_resultados: rows.length,
      resultados: rows
    });
  });
});

// GET /api/pacientes - Listar todos os pacientes
router.get('/', (req, res) => {
  db.all('SELECT * FROM pacientes ORDER BY nome', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar pacientes' });
    }
    res.json(rows);
  });
});

// GET /api/pacientes/:id - Buscar paciente por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM pacientes WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar paciente' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    res.json(row);
  });
});

// POST /api/pacientes - Cadastrar novo paciente
router.post('/', (req, res) => {
  const { nome, cpf, telefone, email, data_nascimento, endereco } = req.body;

  if (!nome || !cpf) {
    return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
  }

  // Validar CPF - apenas números
  const cpfNumeros = cpf.replace(/\D/g, '');
  if (cpfNumeros.length !== 11) {
    return res.status(400).json({ error: 'CPF deve conter exatamente 11 dígitos numéricos' });
  }

  db.run(
    `INSERT INTO pacientes (nome, cpf, telefone, email, data_nascimento, endereco)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, cpfNumeros, telefone, email, data_nascimento, endereco],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'CPF já cadastrado' });
        }
        return res.status(500).json({ error: 'Erro ao cadastrar paciente' });
      }
      res.status(201).json({
        message: 'Paciente cadastrado com sucesso',
        id: this.lastID
      });
    }
  );
});

// PUT /api/pacientes/:id - Atualizar paciente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, cpf, telefone, email, data_nascimento, endereco } = req.body;

  // Validar CPF - apenas números
  const cpfNumeros = cpf ? cpf.replace(/\D/g, '') : null;
  if (cpfNumeros && cpfNumeros.length !== 11) {
    return res.status(400).json({ error: 'CPF deve conter exatamente 11 dígitos numéricos' });
  }

  db.run(
    `UPDATE pacientes
     SET nome = ?, cpf = ?, telefone = ?, email = ?, data_nascimento = ?, endereco = ?
     WHERE id = ?`,
    [nome, cpfNumeros, telefone, email, data_nascimento, endereco, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar paciente' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }
      res.json({ message: 'Paciente atualizado com sucesso' });
    }
  );
});

// DELETE /api/pacientes/:id - Deletar paciente
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM pacientes WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar paciente' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    res.json({ message: 'Paciente deletado com sucesso' });
  });
});

module.exports = router;
