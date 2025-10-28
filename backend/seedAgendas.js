const db = require('./database');

async function seedAgendas() {
  console.log('🌱 Adicionando agendas dos médicos...\n');

  // Dr. Carlos Silva (Cardiologia) - médico_id: 1
  // Segunda a Quarta, 08:00 às 12:00
  const agendasCarlos = [
    { medico_id: 1, dia_semana: 1, horario_inicio: '08:00', horario_fim: '12:00', intervalo_minutos: 30 }, // Segunda
    { medico_id: 1, dia_semana: 2, horario_inicio: '08:00', horario_fim: '12:00', intervalo_minutos: 30 }, // Terça
    { medico_id: 1, dia_semana: 3, horario_inicio: '08:00', horario_fim: '12:00', intervalo_minutos: 30 }, // Quarta
  ];

  // Dra. Ana Paula Costa (Dermatologia) - médico_id: 2
  // Terça e Quinta, 14:00 às 18:00
  const agendasAna = [
    { medico_id: 2, dia_semana: 2, horario_inicio: '14:00', horario_fim: '18:00', intervalo_minutos: 30 }, // Terça
    { medico_id: 2, dia_semana: 4, horario_inicio: '14:00', horario_fim: '18:00', intervalo_minutos: 30 }, // Quinta
  ];

  // Dr. Roberto Santos (Ortopedia) - médico_id: 3
  // Segunda a Sexta, 09:00 às 17:00
  const agendasRoberto = [
    { medico_id: 3, dia_semana: 1, horario_inicio: '09:00', horario_fim: '17:00', intervalo_minutos: 30 }, // Segunda
    { medico_id: 3, dia_semana: 2, horario_inicio: '09:00', horario_fim: '17:00', intervalo_minutos: 30 }, // Terça
    { medico_id: 3, dia_semana: 3, horario_inicio: '09:00', horario_fim: '17:00', intervalo_minutos: 30 }, // Quarta
    { medico_id: 3, dia_semana: 4, horario_inicio: '09:00', horario_fim: '17:00', intervalo_minutos: 30 }, // Quinta
    { medico_id: 3, dia_semana: 5, horario_inicio: '09:00', horario_fim: '17:00', intervalo_minutos: 30 }, // Sexta
  ];

  // Dra. Juliana Oliveira (Pediatria) - médico_id: 4
  // Segunda, Quarta e Sexta, 08:00 às 14:00
  const agendasJuliana = [
    { medico_id: 4, dia_semana: 1, horario_inicio: '08:00', horario_fim: '14:00', intervalo_minutos: 30 }, // Segunda
    { medico_id: 4, dia_semana: 3, horario_inicio: '08:00', horario_fim: '14:00', intervalo_minutos: 30 }, // Quarta
    { medico_id: 4, dia_semana: 5, horario_inicio: '08:00', horario_fim: '14:00', intervalo_minutos: 30 }, // Sexta
  ];

  // Dr. Fernando Lima (Clínico Geral) - médico_id: 5
  // Segunda a Sexta, 08:00 às 12:00 e 14:00 às 18:00
  const agendasFernando = [
    { medico_id: 5, dia_semana: 1, horario_inicio: '08:00', horario_fim: '12:00', intervalo_minutos: 30 }, // Segunda manhã
    { medico_id: 5, dia_semana: 1, horario_inicio: '14:00', horario_fim: '18:00', intervalo_minutos: 30 }, // Segunda tarde
    { medico_id: 5, dia_semana: 2, horario_inicio: '08:00', horario_fim: '12:00', intervalo_minutos: 30 }, // Terça manhã
    { medico_id: 5, dia_semana: 2, horario_inicio: '14:00', horario_fim: '18:00', intervalo_minutos: 30 }, // Terça tarde
    { medico_id: 5, dia_semana: 3, horario_inicio: '08:00', horario_fim: '12:00', intervalo_minutos: 30 }, // Quarta manhã
    { medico_id: 5, dia_semana: 3, horario_inicio: '14:00', horario_fim: '18:00', intervalo_minutos: 30 }, // Quarta tarde
    { medico_id: 5, dia_semana: 4, horario_inicio: '08:00', horario_fim: '12:00', intervalo_minutos: 30 }, // Quinta manhã
    { medico_id: 5, dia_semana: 4, horario_inicio: '14:00', horario_fim: '18:00', intervalo_minutos: 30 }, // Quinta tarde
    { medico_id: 5, dia_semana: 5, horario_inicio: '08:00', horario_fim: '12:00', intervalo_minutos: 30 }, // Sexta manhã
    { medico_id: 5, dia_semana: 5, horario_inicio: '14:00', horario_fim: '18:00', intervalo_minutos: 30 }, // Sexta tarde
  ];

  const todasAgendas = [
    ...agendasCarlos,
    ...agendasAna,
    ...agendasRoberto,
    ...agendasJuliana,
    ...agendasFernando
  ];

  let contador = 0;
  for (const agenda of todasAgendas) {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR IGNORE INTO agenda_medicos (medico_id, dia_semana, horario_inicio, horario_fim, intervalo_minutos)
         VALUES (?, ?, ?, ?, ?)`,
        [agenda.medico_id, agenda.dia_semana, agenda.horario_inicio, agenda.horario_fim, agenda.intervalo_minutos],
        (err) => {
          if (err) {
            console.error('Erro ao criar agenda:', err);
            reject(err);
          } else {
            contador++;
            resolve();
          }
        }
      );
    });
  }

  console.log(`✓ ${contador} agendas criadas\n`);
  console.log('📅 Resumo das agendas:');
  console.log('  Dr. Carlos Silva (Cardiologia): Segunda a Quarta, 08:00-12:00');
  console.log('  Dra. Ana Paula Costa (Dermatologia): Terça e Quinta, 14:00-18:00');
  console.log('  Dr. Roberto Santos (Ortopedia): Segunda a Sexta, 09:00-17:00');
  console.log('  Dra. Juliana Oliveira (Pediatria): Segunda, Quarta e Sexta, 08:00-14:00');
  console.log('  Dr. Fernando Lima (Clínico Geral): Segunda a Sexta, 08:00-12:00 e 14:00-18:00\n');

  console.log('🎉 Agendas configuradas com sucesso!\n');

  setTimeout(() => {
    db.close();
    process.exit(0);
  }, 1000);
}

seedAgendas();
