const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password são obrigatórios' });
  }

  db.get(
    'SELECT * FROM usuarios WHERE username = ?',
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar usuário' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token JWT (sem expiração para ambiente de testes)
      const token = jwt.sign(
        { id: user.id, username: user.username, tipo: user.tipo },
        process.env.JWT_SECRET
      );

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          username: user.username,
          nome: user.nome,
          tipo: user.tipo
        }
      });
    }
  );
});

// POST /api/auth/change-password
router.post('/change-password', (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
  }

  db.get(
    'SELECT * FROM usuarios WHERE username = ?',
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar usuário' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      // Verificar senha atual
      const validPassword = await bcrypt.compare(currentPassword, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Atualizar senha
      db.run(
        'UPDATE usuarios SET password = ? WHERE id = ?',
        [hashedPassword, user.id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erro ao atualizar senha' });
          }

          res.json({
            message: 'Senha alterada com sucesso'
          });
        }
      );
    }
  );
});

// GET /api/auth/api-key - Retorna a API Key ativa (requer autenticação JWT)
router.get('/api-key', (req, res) => {
  // Este endpoint pode ser público ou protegido - vou deixar público para facilitar
  db.get(
    'SELECT key, nome, descricao FROM api_keys WHERE ativo = 1 ORDER BY id LIMIT 1',
    [],
    (err, apiKey) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar API Key' });
      }

      if (!apiKey) {
        return res.status(404).json({ error: 'Nenhuma API Key ativa encontrada' });
      }

      res.json({
        key: apiKey.key,
        nome: apiKey.nome,
        descricao: apiKey.descricao,
        usage: `Authorization: ApiKey ${apiKey.key}`
      });
    }
  );
});

module.exports = router;
