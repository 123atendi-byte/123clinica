const bcrypt = require('bcryptjs');
const db = require('./database');

// Função para verificar se o banco já está populado
function verificarBancoPopulado() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM pacientes', (err, row) => {
      if (err) reject(err);
      else resolve(row.count > 0);
    });
  });
}

async function seed() {
  console.log('🌱 Verificando banco de dados...\n');

  // Verificar se já existe dados
  const jaPopulado = await verificarBancoPopulado();

  if (jaPopulado) {
    console.log('⚠️  Banco já possui dados. Seed cancelado para evitar duplicações.');
    console.log('💡 Para repovoar, delete o arquivo clinica.db e execute novamente.\n');
    db.close();
    process.exit(0);
    return;
  }

  console.log('✓ Banco vazio. Iniciando seed...\n');

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  db.run(
    'INSERT OR IGNORE INTO usuarios (username, password, nome, tipo) VALUES (?, ?, ?, ?)',
    ['admin', hashedPassword, 'Administrador', 'admin'],
    (err) => {
      if (err) {
        console.error('Erro ao criar usuário admin:', err);
      } else {
        console.log('✓ Usuário admin criado (username: admin, password: admin123)');
      }
    }
  );

  // Médicos
  const medicos = [
    { nome: 'Dr. Carlos Silva', crm: 'CRM-SP 123456', especialidade: 'Cardiologia', telefone: '(11) 98765-4321', email: 'carlos.silva@clinica.com' },
    { nome: 'Dra. Ana Paula Costa', crm: 'CRM-SP 234567', especialidade: 'Dermatologia', telefone: '(11) 98765-4322', email: 'ana.costa@clinica.com' },
    { nome: 'Dr. Roberto Santos', crm: 'CRM-SP 345678', especialidade: 'Ortopedia', telefone: '(11) 98765-4323', email: 'roberto.santos@clinica.com' },
    { nome: 'Dra. Juliana Oliveira', crm: 'CRM-SP 456789', especialidade: 'Pediatria', telefone: '(11) 98765-4324', email: 'juliana.oliveira@clinica.com' },
    { nome: 'Dr. Fernando Lima', crm: 'CRM-SP 567890', especialidade: 'Clínico Geral', telefone: '(11) 98765-4325', email: 'fernando.lima@clinica.com' }
  ];

  medicos.forEach((medico) => {
    db.run(
      'INSERT OR IGNORE INTO medicos (nome, crm, especialidade, telefone, email) VALUES (?, ?, ?, ?, ?)',
      [medico.nome, medico.crm, medico.especialidade, medico.telefone, medico.email],
      (err) => {
        if (err && !err.message.includes('UNIQUE')) {
          console.error('Erro ao criar médico:', err);
        }
      }
    );
  });

  console.log(`✓ ${medicos.length} médicos criados`);

  // Pacientes (CPF somente números)
  const pacientes = [
    { nome: 'Maria Santos', cpf: '12345678901', telefone: '(11) 91234-5601', email: 'maria.santos@email.com', data_nascimento: '1985-03-15', endereco: 'Rua das Flores, 100' },
    { nome: 'João Silva', cpf: '12345678902', telefone: '(11) 91234-5602', email: 'joao.silva@email.com', data_nascimento: '1990-07-22', endereco: 'Av. Paulista, 200' },
    { nome: 'Ana Costa', cpf: '12345678903', telefone: '(11) 91234-5603', email: 'ana.costa@email.com', data_nascimento: '1978-11-30', endereco: 'Rua Augusta, 300' },
    { nome: 'Pedro Oliveira', cpf: '12345678904', telefone: '(11) 91234-5604', email: 'pedro.oliveira@email.com', data_nascimento: '1995-05-18', endereco: 'Rua Consolação, 400' },
    { nome: 'Carla Souza', cpf: '12345678905', telefone: '(11) 91234-5605', email: 'carla.souza@email.com', data_nascimento: '1988-09-25', endereco: 'Av. Rebouças, 500' },
    { nome: 'Lucas Pereira', cpf: '12345678906', telefone: '(11) 91234-5606', email: 'lucas.pereira@email.com', data_nascimento: '1992-12-08', endereco: 'Rua Haddock Lobo, 600' },
    { nome: 'Fernanda Lima', cpf: '12345678907', telefone: '(11) 91234-5607', email: 'fernanda.lima@email.com', data_nascimento: '1980-04-14', endereco: 'Rua Oscar Freire, 700' },
    { nome: 'Ricardo Alves', cpf: '12345678908', telefone: '(11) 91234-5608', email: 'ricardo.alves@email.com', data_nascimento: '1987-08-20', endereco: 'Av. Faria Lima, 800' },
    { nome: 'Patrícia Rocha', cpf: '12345678909', telefone: '(11) 91234-5609', email: 'patricia.rocha@email.com', data_nascimento: '1993-02-11', endereco: 'Rua Pamplona, 900' },
    { nome: 'Marcos Ferreira', cpf: '12345678910', telefone: '(11) 91234-5610', email: 'marcos.ferreira@email.com', data_nascimento: '1975-06-27', endereco: 'Av. Ibirapuera, 1000' },
    { nome: 'Juliana Martins', cpf: '12345678911', telefone: '(11) 91234-5611', email: 'juliana.martins@email.com', data_nascimento: '1991-10-05', endereco: 'Rua Vergueiro, 1100' },
    { nome: 'Rafael Cardoso', cpf: '12345678912', telefone: '(11) 91234-5612', email: 'rafael.cardoso@email.com', data_nascimento: '1984-01-19', endereco: 'Rua da Mooca, 1200' },
    { nome: 'Beatriz Gomes', cpf: '12345678913', telefone: '(11) 91234-5613', email: 'beatriz.gomes@email.com', data_nascimento: '1989-03-28', endereco: 'Av. Angélica, 1300' },
    { nome: 'Gustavo Ribeiro', cpf: '12345678914', telefone: '(11) 91234-5614', email: 'gustavo.ribeiro@email.com', data_nascimento: '1996-07-16', endereco: 'Rua Estados Unidos, 1400' },
    { nome: 'Amanda Araújo', cpf: '12345678915', telefone: '(11) 91234-5615', email: 'amanda.araujo@email.com', data_nascimento: '1982-11-23', endereco: 'Av. Brigadeiro, 1500' },
    { nome: 'Felipe Barbosa', cpf: '12345678916', telefone: '(11) 91234-5616', email: 'felipe.barbosa@email.com', data_nascimento: '1994-05-09', endereco: 'Rua Bela Cintra, 1600' },
    { nome: 'Camila Mendes', cpf: '12345678917', telefone: '(11) 91234-5617', email: 'camila.mendes@email.com', data_nascimento: '1986-09-12', endereco: 'Av. Europa, 1700' },
    { nome: 'Bruno Teixeira', cpf: '12345678918', telefone: '(11) 91234-5618', email: 'bruno.teixeira@email.com', data_nascimento: '1990-12-31', endereco: 'Rua Joaquim Floriano, 1800' },
    { nome: 'Larissa Duarte', cpf: '12345678919', telefone: '(11) 91234-5619', email: 'larissa.duarte@email.com', data_nascimento: '1983-04-07', endereco: 'Av. Santo Amaro, 1900' },
    { nome: 'Diego Nunes', cpf: '12345678920', telefone: '(11) 91234-5620', email: 'diego.nunes@email.com', data_nascimento: '1997-08-24', endereco: 'Rua Itaim Bibi, 2000' }
  ];

  pacientes.forEach((paciente) => {
    db.run(
      'INSERT OR IGNORE INTO pacientes (nome, cpf, telefone, email, data_nascimento, endereco) VALUES (?, ?, ?, ?, ?, ?)',
      [paciente.nome, paciente.cpf, paciente.telefone, paciente.email, paciente.data_nascimento, paciente.endereco],
      (err) => {
        if (err && !err.message.includes('UNIQUE')) {
          console.error('Erro ao criar paciente:', err);
        }
      }
    );
  });

  console.log(`✓ ${pacientes.length} pacientes criados`);

  // Aguardar inserções e criar consultas
  setTimeout(() => {
    const consultas = [
      { paciente_id: 1, medico_id: 1, data_consulta: '2025-11-01', horario: '09:00', status: 'agendada' },
      { paciente_id: 2, medico_id: 2, data_consulta: '2025-11-01', horario: '10:00', status: 'agendada' },
      { paciente_id: 3, medico_id: 3, data_consulta: '2025-11-01', horario: '14:00', status: 'agendada' },
      { paciente_id: 4, medico_id: 4, data_consulta: '2025-11-02', horario: '08:30', status: 'agendada' },
      { paciente_id: 5, medico_id: 5, data_consulta: '2025-11-02', horario: '11:00', status: 'agendada' },
      { paciente_id: 6, medico_id: 1, data_consulta: '2025-11-03', horario: '09:30', status: 'agendada' },
      { paciente_id: 7, medico_id: 2, data_consulta: '2025-11-03', horario: '13:00', status: 'agendada' },
      { paciente_id: 8, medico_id: 3, data_consulta: '2025-11-04', horario: '10:30', status: 'agendada' },
      { paciente_id: 9, medico_id: 4, data_consulta: '2025-11-04', horario: '15:00', status: 'agendada' },
      { paciente_id: 10, medico_id: 5, data_consulta: '2025-11-05', horario: '08:00', status: 'agendada' },
      { paciente_id: 11, medico_id: 1, data_consulta: '2025-11-05', horario: '14:30', status: 'agendada' },
      { paciente_id: 12, medico_id: 2, data_consulta: '2025-11-06', horario: '09:00', status: 'agendada' },
      { paciente_id: 13, medico_id: 3, data_consulta: '2025-11-06', horario: '16:00', status: 'agendada' },
      { paciente_id: 14, medico_id: 4, data_consulta: '2025-11-07', horario: '10:00', status: 'agendada' },
      { paciente_id: 15, medico_id: 5, data_consulta: '2025-11-07', horario: '13:30', status: 'agendada' }
    ];

    consultas.forEach((consulta) => {
      db.run(
        'INSERT OR IGNORE INTO consultas (paciente_id, medico_id, data_consulta, horario, status) VALUES (?, ?, ?, ?, ?)',
        [consulta.paciente_id, consulta.medico_id, consulta.data_consulta, consulta.horario, consulta.status],
        (err) => {
          if (err) {
            console.error('Erro ao criar consulta:', err);
          }
        }
      );
    });

    console.log(`✓ ${consultas.length} consultas agendadas`);
    console.log('\n🎉 Seed concluído com sucesso!\n');

    setTimeout(() => {
      db.close();
      process.exit(0);
    }, 1000);
  }, 1000);
}

seed();
