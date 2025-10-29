import React, { useState, useEffect } from 'react';
import { FaKey, FaCopy, FaCheckCircle, FaCode, FaInfoCircle, FaLock, FaSync } from 'react-icons/fa';
import './ChaveAPI.css';
import api from '../services/api';

const ChaveAPI = () => {
  // Estado para armazenar a API Key carregada do backend
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Buscar API Key do backend quando o componente montar
  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/auth/api-key');
      setApiKey(response.data.key);
    } catch (err) {
      console.error('Erro ao carregar API Key:', err);
      setError('Erro ao carregar a API Key. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNewKey = async () => {
    if (!window.confirm('Tem certeza que deseja gerar uma nova API Key? A chave antiga será desativada.')) {
      return;
    }

    try {
      setGenerating(true);
      const response = await api.post('/auth/generate-api-key');
      setApiKey(response.data.key);
      alert('Nova API Key gerada com sucesso! Certifique-se de atualizar suas integrações.');
    } catch (err) {
      console.error('Erro ao gerar nova API Key:', err);
      alert('Erro ao gerar nova API Key. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  return (
    <div className="chave-api">
      <div className="page-header">
        <h1><FaKey /> Chave API Fixa</h1>
        <p className="subtitle">Use esta chave permanente para autenticar suas requisições à API</p>
      </div>

      {loading ? (
        <div className="card token-card">
          <div className="loading-state">
            <FaSync className="spin-icon" />
            <p>Carregando API Key...</p>
          </div>
        </div>
      ) : error ? (
        <div className="card token-card error-card">
          <div className="error-state">
            <FaInfoCircle size={24} />
            <p>{error}</p>
            <button className="btn-retry" onClick={loadApiKey}>
              <FaSync /> Tentar Novamente
            </button>
          </div>
        </div>
      ) : (
        <div className="card token-card">
          <div className="token-header">
            <FaLock size={24} className="lock-icon" />
            <div className="token-header-content">
              <h3>API Key Principal</h3>
              <p className="token-description">
                Chave fixa para integração via API - Nunca expira
              </p>
            </div>
            <button
              className="btn-generate"
              onClick={handleGenerateNewKey}
              disabled={generating}
              title="Gerar nova API Key"
            >
              <FaSync className={generating ? 'spin-icon-small' : ''} />
              {generating ? 'Gerando...' : 'Gerar Nova'}
            </button>
          </div>

          <div className="token-box">
            <div className="token-content">
              <code>{apiKey}</code>
            </div>
            <button
              className={`btn-copy ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              title="Copiar API Key"
            >
              {copied ? <FaCheckCircle /> : <FaCopy />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <div className="token-info">
            <FaInfoCircle />
            <span>
              Esta API Key é permanente e não expira. Use-a em suas integrações externas.
            </span>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="card examples-card">
          <h3><FaCode /> Exemplos de Uso</h3>

          <div className="example-section">
            <h4>JavaScript (Fetch API)</h4>
            <pre className="code-block">
{`fetch('${apiUrl}/pacientes', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro:', error));`}
            </pre>
          </div>

          <div className="example-section">
            <h4>JavaScript (Axios)</h4>
            <pre className="code-block">
{`import axios from 'axios';

axios.get('${apiUrl}/pacientes', {
  headers: {
    'Authorization': 'Bearer ${apiKey}'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error('Erro:', error));`}
            </pre>
          </div>

          <div className="example-section">
            <h4>cURL</h4>
            <pre className="code-block curl-block">
{`curl -X GET "${apiUrl}/pacientes" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`}
            </pre>
          </div>

          <div className="example-section">
            <h4>Python (Requests)</h4>
            <pre className="code-block">
{`import requests

headers = {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
}

response = requests.get('${apiUrl}/pacientes', headers=headers)
print(response.json())`}
            </pre>
          </div>

          <div className="example-section">
            <h4>Criar Novo Paciente (POST)</h4>
            <pre className="code-block">
{`fetch('${apiUrl}/pacientes', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome: 'João Silva',
    cpf: '12345678900',
    telefone: '(11) 98765-4321',
    email: 'joao@email.com',
    data_nascimento: '1990-01-15',
    endereco: 'Rua Exemplo, 123'
  })
})
.then(response => response.json())
.then(data => console.log(data));`}
            </pre>
          </div>

          <div className="example-section">
            <h4>Agendar Consulta (POST)</h4>
            <pre className="code-block">
{`fetch('${apiUrl}/agenda', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    paciente_id: 1,
    medico_id: 1,
    data_consulta: '2025-11-15',
    horario: '14:00',
    observacoes: 'Primeira consulta'
  })
})
.then(response => response.json())
.then(data => console.log(data));`}
            </pre>
          </div>
        </div>
      )}

      <div className="card info-card">
        <h3>Informações Importantes</h3>
        <ul>
          <li>
            <strong>Permanente:</strong> Esta API Key nunca expira e não muda quando você faz login/logout no sistema
          </li>
          <li>
            <strong>Formato:</strong> Use <code>Authorization: Bearer {'{sua-chave}'}</code> no header da requisição
          </li>
          <li>
            <strong>Compatível:</strong> Esta API Key fixa funciona com o formato Bearer padrão, igual aos exemplos da API Docs
          </li>
          <li>
            <strong>Segurança:</strong> Nunca compartilhe esta chave em repositórios públicos, logs ou código frontend público
          </li>
          <li>
            <strong>Uso:</strong> Ideal para integrações com sistemas externos, automações, scripts Python, aplicativos mobile, etc.
          </li>
          <li>
            <strong>Endpoints Disponíveis:</strong>
            <ul className="nested-list">
              <li>GET /api/pacientes - Listar pacientes</li>
              <li>POST /api/pacientes - Criar paciente</li>
              <li>GET /api/medicos - Listar médicos</li>
              <li>POST /api/medicos - Criar médico</li>
              <li>GET /api/agenda - Listar consultas</li>
              <li>POST /api/agenda - Agendar consulta</li>
              <li>GET /api/agenda/horarios-livres - Horários disponíveis</li>
            </ul>
          </li>
          <li>
            <strong>Documentação Completa:</strong> Consulte a página "API Docs" para detalhes de todos os endpoints
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChaveAPI;
