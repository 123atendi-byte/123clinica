const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'clinica.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✓ Conectado ao banco de dados SQLite');
  }
});

// Criar tabelas
db.serialize(() => {
  // Tabela de usuários (para login)
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de pacientes
  db.run(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT UNIQUE NOT NULL,
      telefone TEXT,
      email TEXT,
      data_nascimento TEXT,
      endereco TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de médicos
  db.run(`
    CREATE TABLE IF NOT EXISTS medicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      crm TEXT UNIQUE NOT NULL,
      especialidade TEXT NOT NULL,
      telefone TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de consultas
  db.run(`
    CREATE TABLE IF NOT EXISTS consultas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo_consulta INTEGER UNIQUE NOT NULL,
      paciente_id INTEGER NOT NULL,
      medico_id INTEGER NOT NULL,
      data_consulta TEXT NOT NULL,
      horario TEXT NOT NULL,
      status TEXT DEFAULT 'agendada',
      observacoes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paciente_id) REFERENCES pacientes (id),
      FOREIGN KEY (medico_id) REFERENCES medicos (id)
    )
  `);

  // Tabela de agenda dos médicos
  db.run(`
    CREATE TABLE IF NOT EXISTS agenda_medicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medico_id INTEGER NOT NULL,
      dia_semana INTEGER NOT NULL,
      horario_inicio TEXT NOT NULL,
      horario_fim TEXT NOT NULL,
      intervalo_minutos INTEGER DEFAULT 30,
      ativo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (medico_id) REFERENCES medicos (id)
    )
  `);

  // Tabela de bloqueios de agenda (folgas, férias, etc)
  db.run(`
    CREATE TABLE IF NOT EXISTS bloqueios_agenda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medico_id INTEGER NOT NULL,
      data_inicio TEXT NOT NULL,
      data_fim TEXT NOT NULL,
      horario_inicio TEXT,
      horario_fim TEXT,
      motivo TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (medico_id) REFERENCES medicos (id)
    )
  `);

  // Tabela de API Keys (chaves fixas para integração)
  db.run(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      descricao TEXT,
      ativo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✓ Tabelas criadas/verificadas com sucesso');
});

module.exports = db;
