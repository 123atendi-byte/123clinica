import React, { useState } from 'react';
import { FaBook, FaCode, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './ApiDocs.css';

const ApiDocs = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);

  const endpoints = [
    {
      category: 'Autenticação',
      items: [
        {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Realiza login e retorna token JWT',
          request: {
            username: 'admin',
            password: 'admin123'
          },
          response: {
            message: 'Login realizado com sucesso',
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            user: {
              id: 1,
              username: 'admin',
              nome: 'Administrador',
              tipo: 'admin'
            }
          }
        }
      ]
    },
    {
      category: 'Pacientes',
      items: [
        {
          method: 'GET',
          path: '/api/pacientes',
          description: 'Lista todos os pacientes',
          request: null,
          response: [
            {
              id: 1,
              nome: 'João Silva',
              cpf: '123.456.789-00',
              telefone: '(11) 98765-4321',
              email: 'joao@email.com',
              data_nascimento: '1990-01-15',
              endereco: 'Rua das Flores, 123'
            }
          ]
        },
        {
          method: 'GET',
          path: '/api/pacientes/:id',
          description: 'Busca um paciente específico por ID',
          request: null,
          response: {
            id: 1,
            nome: 'João Silva',
            cpf: '123.456.789-00',
            telefone: '(11) 98765-4321',
            email: 'joao@email.com',
            data_nascimento: '1990-01-15',
            endereco: 'Rua das Flores, 123'
          }
        },
        {
          method: 'POST',
          path: '/api/pacientes',
          description: 'Cria um novo paciente',
          request: {
            nome: 'Maria Santos',
            cpf: '987.654.321-00',
            telefone: '(11) 91234-5678',
            email: 'maria@email.com',
            data_nascimento: '1985-05-20',
            endereco: 'Av. Principal, 456'
          },
          response: {
            message: 'Paciente criado com sucesso',
            id: 21
          }
        },
        {
          method: 'PUT',
          path: '/api/pacientes/:id',
          description: 'Atualiza dados de um paciente',
          request: {
            nome: 'João Silva Santos',
            telefone: '(11) 98765-9999',
            email: 'joao.novo@email.com'
          },
          response: {
            message: 'Paciente atualizado com sucesso'
          }
        },
        {
          method: 'DELETE',
          path: '/api/pacientes/:id',
          description: 'Remove um paciente',
          request: null,
          response: {
            message: 'Paciente deletado com sucesso'
          }
        }
      ]
    },
    {
      category: 'Médicos',
      items: [
        {
          method: 'GET',
          path: '/api/medicos',
          description: 'Lista todos os médicos',
          request: null,
          response: [
            {
              id: 1,
              nome: 'Dr. Carlos Oliveira',
              crm: 'CRM-SP 123456',
              especialidade: 'Cardiologia',
              telefone: '(11) 3456-7890',
              email: 'carlos@clinica.com'
            }
          ]
        },
        {
          method: 'GET',
          path: '/api/medicos/:id',
          description: 'Busca um médico específico por ID',
          request: null,
          response: {
            id: 1,
            nome: 'Dr. Carlos Oliveira',
            crm: 'CRM-SP 123456',
            especialidade: 'Cardiologia',
            telefone: '(11) 3456-7890',
            email: 'carlos@clinica.com'
          }
        },
        {
          method: 'POST',
          path: '/api/medicos',
          description: 'Cadastra um novo médico',
          request: {
            nome: 'Dra. Ana Paula',
            crm: 'CRM-SP 654321',
            especialidade: 'Neurologia',
            telefone: '(11) 3333-4444',
            email: 'ana@clinica.com'
          },
          response: {
            message: 'Médico criado com sucesso',
            id: 6
          }
        },
        {
          method: 'PUT',
          path: '/api/medicos/:id',
          description: 'Atualiza dados de um médico',
          request: {
            telefone: '(11) 3333-9999',
            email: 'ana.novo@clinica.com'
          },
          response: {
            message: 'Médico atualizado com sucesso'
          }
        },
        {
          method: 'DELETE',
          path: '/api/medicos/:id',
          description: 'Remove um médico',
          request: null,
          response: {
            message: 'Médico deletado com sucesso'
          }
        }
      ]
    },
    {
      category: 'Agenda / Consultas',
      items: [
        {
          method: 'GET',
          path: '/api/agenda/horarios-livres',
          description: 'Retorna horários disponíveis de um médico em uma data',
          queryParams: {
            medico_id: 1,
            data: '2025-11-15'
          },
          request: null,
          response: {
            data: '2025-11-15',
            medico_id: 1,
            dia_semana: 5,
            horarios_livres: ['08:00', '08:30', '09:00', '09:30', '10:00'],
            total_disponiveis: 5
          }
        },
        {
          method: 'GET',
          path: '/api/agenda',
          description: 'Lista consultas agendadas (pode filtrar por datas, médico, paciente e status)',
          queryParams: {
            data_inicio: '2025-11-01',
            data_fim: '2025-11-30',
            medico_id: 1,
            status: 'agendada'
          },
          request: null,
          response: [
            {
              id: 1,
              data_consulta: '2025-11-15',
              horario: '09:00',
              status: 'agendada',
              observacoes: 'Paciente com histórico de hipertensão',
              created_at: '2025-11-01 10:30:00',
              paciente: {
                id: 5,
                nome: 'João Silva',
                telefone: '(11) 98765-4321'
              },
              medico: {
                id: 1,
                nome: 'Dr. Carlos Oliveira',
                especialidade: 'Cardiologia'
              }
            }
          ]
        },
        {
          method: 'POST',
          path: '/api/agenda',
          description: 'Agenda uma nova consulta',
          request: {
            paciente_id: 5,
            medico_id: 1,
            data_consulta: '2025-11-20',
            horario: '10:00',
            observacoes: 'Consulta de rotina'
          },
          response: {
            message: 'Consulta agendada com sucesso',
            id: 16
          }
        },
        {
          method: 'PUT',
          path: '/api/agenda/:id',
          description: 'Atualiza status e observações de uma consulta',
          request: {
            status: 'confirmada',
            observacoes: 'Paciente confirmou presença'
          },
          response: {
            message: 'Consulta atualizada com sucesso'
          }
        },
        {
          method: 'DELETE',
          path: '/api/agenda/:id',
          description: 'Cancela uma consulta (altera status para "cancelada")',
          request: null,
          response: {
            message: 'Consulta cancelada com sucesso'
          }
        }
      ]
    },
    {
      category: 'Agenda dos Médicos',
      items: [
        {
          method: 'GET',
          path: '/api/agenda-medicos',
          description: 'Lista todas as agendas configuradas',
          request: null,
          response: [
            {
              id: 1,
              medico_id: 1,
              dia_semana: 1,
              horario_inicio: '08:00',
              horario_fim: '12:00',
              intervalo_minutos: 30,
              ativo: 1
            }
          ]
        },
        {
          method: 'GET',
          path: '/api/agenda-medicos/:medico_id',
          description: 'Lista agenda de um médico específico',
          request: null,
          response: [
            {
              id: 1,
              medico_id: 1,
              dia_semana: 1,
              horario_inicio: '08:00',
              horario_fim: '12:00',
              intervalo_minutos: 30,
              ativo: 1
            }
          ]
        },
        {
          method: 'POST',
          path: '/api/agenda-medicos',
          description: 'Cria uma nova agenda para um médico',
          request: {
            medico_id: 1,
            dia_semana: 5,
            horario_inicio: '14:00',
            horario_fim: '18:00',
            intervalo_minutos: 30
          },
          response: {
            message: 'Agenda criada com sucesso',
            id: 11
          }
        },
        {
          method: 'PUT',
          path: '/api/agenda-medicos/:id',
          description: 'Atualiza uma agenda existente',
          request: {
            horario_inicio: '13:00',
            horario_fim: '17:00'
          },
          response: {
            message: 'Agenda atualizada com sucesso'
          }
        },
        {
          method: 'DELETE',
          path: '/api/agenda-medicos/:id',
          description: 'Remove uma agenda',
          request: null,
          response: {
            message: 'Agenda deletada com sucesso'
          }
        }
      ]
    }
  ];

  const getMethodColor = (method) => {
    const colors = {
      GET: '#3b82f6',
      POST: '#22c55e',
      PUT: '#f59e0b',
      DELETE: '#ef4444'
    };
    return colors[method] || '#6b7280';
  };

  return (
    <div className="api-docs">
      <div className="page-header">
        <h1><FaBook /> Documentação da API</h1>
        <p className="subtitle">Referência completa dos endpoints disponíveis</p>
      </div>

      <div className="api-info card">
        <h3><FaCheckCircle /> Informações Gerais</h3>
        <div className="info-grid">
          <div className="info-item">
            <strong>Base URL:</strong>
            <code>http://localhost:3001/api</code>
          </div>
          <div className="info-item">
            <strong>Autenticação:</strong>
            <code>Bearer Token (JWT)</code>
          </div>
          <div className="info-item">
            <strong>Content-Type:</strong>
            <code>application/json</code>
          </div>
          <div className="info-item">
            <strong>Usuário padrão:</strong>
            <code>admin / admin123</code>
          </div>
        </div>

        <div className="auth-note">
          <FaExclamationCircle />
          <p>
            <strong>Nota:</strong> Todos os endpoints (exceto /api/auth/login) requerem autenticação.
            Inclua o token JWT no header: <code>Authorization: Bearer {'<token>'}</code>
          </p>
        </div>
      </div>

      <div className="endpoints-container">
        {endpoints.map((category, idx) => (
          <div key={idx} className="card category-section">
            <h2 className="category-title">{category.category}</h2>

            <div className="endpoints-list">
              {category.items.map((endpoint, endpointIdx) => (
                <div key={endpointIdx} className="endpoint-item">
                  <div
                    className="endpoint-header"
                    onClick={() => setSelectedEndpoint(
                      selectedEndpoint === `${idx}-${endpointIdx}`
                        ? null
                        : `${idx}-${endpointIdx}`
                    )}
                  >
                    <div className="endpoint-title">
                      <span
                        className="method-badge"
                        style={{ backgroundColor: getMethodColor(endpoint.method) }}
                      >
                        {endpoint.method}
                      </span>
                      <code className="endpoint-path">{endpoint.path}</code>
                    </div>
                    <p className="endpoint-description">{endpoint.description}</p>
                  </div>

                  {selectedEndpoint === `${idx}-${endpointIdx}` && (
                    <div className="endpoint-details">
                      {endpoint.queryParams && (
                        <div className="code-section">
                          <h4><FaCode /> Query Parameters</h4>
                          <pre className="code-block">
                            {JSON.stringify(endpoint.queryParams, null, 2)}
                          </pre>
                        </div>
                      )}

                      {endpoint.request && (
                        <div className="code-section">
                          <h4><FaCode /> Request Body</h4>
                          <pre className="code-block">
                            {JSON.stringify(endpoint.request, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="code-section">
                        <h4><FaCode /> Response</h4>
                        <pre className="code-block">
                          {JSON.stringify(endpoint.response, null, 2)}
                        </pre>
                      </div>

                      <div className="code-section">
                        <h4><FaCode /> Exemplo com cURL</h4>
                        <pre className="code-block curl-example">
{endpoint.method === 'GET'
  ? `curl -X GET "${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}${endpoint.path}${endpoint.queryParams ? '?' + new URLSearchParams(endpoint.queryParams).toString() : ''}" \\
  -H "Authorization: Bearer <token>"`
  : `curl -X ${endpoint.method} "${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}${endpoint.path}" \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(endpoint.request || {}, null, 2)}'`}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card notes-section">
        <h3>Notas Adicionais</h3>
        <ul>
          <li>
            <strong>Status de Consulta:</strong> Os valores possíveis são:
            <code>agendada</code>, <code>confirmada</code>, <code>realizada</code>, <code>cancelada</code>
          </li>
          <li>
            <strong>Dia da Semana:</strong> Usa o padrão 0-6, onde
            0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
          </li>
          <li>
            <strong>Formato de Data:</strong> Utilizar formato ISO (YYYY-MM-DD), exemplo: 2025-11-15
          </li>
          <li>
            <strong>Formato de Horário:</strong> Utilizar formato 24h (HH:MM), exemplo: 14:30
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ApiDocs;
