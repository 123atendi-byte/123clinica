import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { FaKey, FaCopy, FaCheckCircle, FaCode, FaInfoCircle, FaLock } from 'react-icons/fa';
import './ChaveAPI.css';

const ChaveAPI = () => {
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/api-key');
      const data = await response.json();
      setApiKey(data);
    } catch (err) {
      setError('Erro ao carregar API Key');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (apiKey?.key) {
      navigator.clipboard.writeText(apiKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  if (loading) {
    return (
      <div className="chave-api">
        <div className="page-header">
          <h1><FaKey /> Chave API</h1>
        </div>
        <div className="card">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chave-api">
        <div className="page-header">
          <h1><FaKey /> Chave API</h1>
        </div>
        <div className="card error-card">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chave-api">
      <div className="page-header">
        <h1><FaKey /> Chave API Fixa</h1>
        <p className="subtitle">Use esta chave permanente para autenticar suas requisições à API</p>
      </div>

      <div className="card token-card">
        <div className="token-header">
          <FaLock size={24} className="lock-icon" />
          <div>
            <h3>{apiKey?.nome || 'API Key Principal'}</h3>
            <p className="token-description">
              {apiKey?.descricao || 'Chave fixa para integração via API'}
            </p>
          </div>
        </div>

        <div className="token-box">
          <div className="token-content">
            <code>{apiKey?.key}</code>
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

      <div className="card examples-card">
        <h3><FaCode /> Exemplos de Uso</h3>

        <div className="example-section">
          <h4>JavaScript (Fetch API)</h4>
          <pre className="code-block">
{`fetch('${apiUrl}/pacientes', {
  method: 'GET',
  headers: {
    'Authorization': 'ApiKey ${apiKey?.key}',
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
    'Authorization': 'ApiKey ${apiKey?.key}'
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
  -H "Authorization: ApiKey ${apiKey?.key}" \\
  -H "Content-Type: application/json"`}
          </pre>
        </div>

        <div className="example-section">
          <h4>Python (Requests)</h4>
          <pre className="code-block">
{`import requests

headers = {
    'Authorization': 'ApiKey ${apiKey?.key}',
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
    'Authorization': 'ApiKey ${apiKey?.key}',
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
      </div>

      <div className="card info-card">
        <h3>Informações Importantes</h3>
        <ul>
          <li>
            <strong>Permanente:</strong> Esta API Key nunca expira e não muda quando você faz login/logout
          </li>
          <li>
            <strong>Formato:</strong> Use "Authorization: ApiKey {'{sua-chave}'}" no header da requisição
          </li>
          <li>
            <strong>Diferença do JWT:</strong> O token JWT do login é para uso no frontend e expira. Esta API Key é para integrações externas e nunca expira.
          </li>
          <li>
            <strong>Segurança:</strong> Nunca compartilhe esta chave em repositórios públicos ou logs
          </li>
          <li>
            <strong>Endpoints:</strong> Todos os endpoints (exceto /api/auth/login) aceitam autenticação via API Key
          </li>
          <li>
            <strong>Documentação:</strong> Consulte a página "API Docs" para lista completa de endpoints disponíveis
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChaveAPI;
