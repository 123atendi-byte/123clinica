require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de autenticação
const verifyToken = require('./middleware/auth');

// Importar rotas
const authRoutes = require('./routes/auth');
const pacientesRoutes = require('./routes/pacientes');
const medicosRoutes = require('./routes/medicos');
const agendaRoutes = require('./routes/agenda');
const agendaMedicosRoutes = require('./routes/agendaMedicos');
const bloqueiosRoutes = require('./routes/bloqueios');

// Usar rotas (auth é pública, demais são protegidas)
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', verifyToken, pacientesRoutes);
app.use('/api/medicos', verifyToken, medicosRoutes);
app.use('/api/agenda', verifyToken, agendaRoutes);
app.use('/api/agenda-medicos', verifyToken, agendaMedicosRoutes);
app.use('/api/bloqueios', verifyToken, bloqueiosRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'API Clínica - Sistema de Agendamento',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login',
      pacientes: '/api/pacientes',
      medicos: '/api/medicos',
      agenda: '/api/agenda',
      agendaMedicos: '/api/agenda-medicos'
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`\n📚 Endpoints disponíveis:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/pacientes`);
  console.log(`   POST   /api/pacientes`);
  console.log(`   GET    /api/medicos`);
  console.log(`   POST   /api/medicos`);
  console.log(`   GET    /api/agenda/horarios-livres`);
  console.log(`   POST   /api/agenda`);
  console.log(`   GET    /api/agenda\n`);
});

module.exports = app;
