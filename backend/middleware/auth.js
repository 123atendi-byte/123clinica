const jwt = require('jsonwebtoken');

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
  // Pegar token do header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido. Acesso negado.' });
  }

  try {
    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adiciona dados do usuário na requisição
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = verifyToken;
