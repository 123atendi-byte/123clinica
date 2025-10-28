const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'clinica.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    process.exit(1);
  } else {
    console.log('✓ Conectado ao banco de dados SQLite');
  }
});

console.log('\n🗑️  Limpando banco de dados...\n');

db.serialize(() => {
  // Deletar todas as consultas
  db.run('DELETE FROM consultas', function(err) {
    if (err) {
      console.error('❌ Erro ao limpar consultas:', err.message);
    } else {
      console.log(`✓ ${this.changes} consultas deletadas`);
    }
  });

  // Resetar o auto-increment
  db.run("DELETE FROM sqlite_sequence WHERE name='consultas'", function(err) {
    if (err) {
      console.error('❌ Erro ao resetar sequência:', err.message);
    } else {
      console.log('✓ Sequência de IDs resetada');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('❌ Erro ao fechar banco de dados:', err.message);
  } else {
    console.log('\n✅ Banco de dados limpo com sucesso!\n');
  }
});
