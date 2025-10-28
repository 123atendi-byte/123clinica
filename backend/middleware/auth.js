const jwt = require('jsonwebtoken');
const db = require('../database');

// Middleware para verificar token JWT ou API Key
const verifyToken = (req, res, next) => {
  // Pegar token do header Authorization
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token ou API Key não fornecido. Acesso negado.' });
  }

  // Verificar se é API Key (começa com "ApiKey ")
  if (authHeader.startsWith('ApiKey ')) {
    const apiKey = authHeader.split(' ')[1];

    // Validar API Key no banco de dados
    db.get(
      'SELECT * FROM api_keys WHERE key = ? AND ativo = 1',
      [apiKey],
      (err, key) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao validar API Key.' });
        }

        if (!key) {
          return res.status(403).json({ error: 'API Key inválida ou inativa.' });
        }

        // API Key válida - adicionar info na requisição
        req.apiKey = key;
        req.authMethod = 'apikey';
        next();
      }
    );
  }
  // Verificar se é JWT (começa com "Bearer ")
  else if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      // Verificar e decodificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Adiciona dados do usuário na requisição
      req.authMethod = 'jwt';
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
  }
  else {
    return res.status(401).json({ error: 'Formato de autenticação inválido. Use "Bearer TOKEN" ou "ApiKey KEY".' });
  }
};

module.exports = verifyToken;
