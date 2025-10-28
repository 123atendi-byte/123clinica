import React, { useState, useEffect } from 'react';
import { FaKey, FaCopy, FaCheckCircle, FaCode, FaExclamationTriangle } from 'react-icons/fa';
import './ChaveAPI.css';

const ChaveAPI = () => {
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao parsear usuário:', error);
      }
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  return (
    <div className="chave-api">
      <div className="page-header">
        <h1><FaKey /> Chave API (Token JWT)</h1>
        <p className="subtitle">Use este token para autenticar suas requisições à API</p>
      </div>

      {!token ? (
        <div className="card warning-card">
          <FaExclamationTriangle size={48} />
          <h3>Nenhum token disponível</h3>
          <p>Você precisa estar logado para visualizar seu token de API.</p>
        </div>
      ) : (
        <>
          <div className="card user-info-card">
            <h3>Informações do Usuário</h3>
            {user && (
              <div className="user-details">
                <div className="user-detail">
                  <strong>Nome:</strong> {user.nome}
                </div>
                <div className="user-detail">
                  <strong>Usuário:</strong> {user.username}
                </div>
                <div className="user-detail">
                  <strong>Tipo:</strong> {user.tipo}
                </div>
              </div>
            )}
          </div>

          <div className="card token-card">
            <h3>Seu Token JWT</h3>
            <p className="token-description">
              Este token identifica você e autoriza suas requisições à API.
              Mantenha-o seguro e não compartilhe publicamente.
            </p>

            <div className="token-box">
              <div className="token-content">
                <code>{token}</code>
              </div>
              <button
                className={`btn-copy ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
                title="Copiar token"
              >
                {copied ? <FaCheckCircle /> : <FaCopy />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <div className="token-warning">
              <FaExclamationTriangle />
              <span>
                Este token expira em 24 horas. Após expirar, você precisará fazer login novamente.
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
    'Authorization': 'Bearer ${token.substring(0, 20)}...',
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
    'Authorization': 'Bearer ${token.substring(0, 20)}...'
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
  -H "Authorization: Bearer ${token.substring(0, 20)}..." \\
  -H "Content-Type: application/json"`}
              </pre>
            </div>

            <div className="example-section">
              <h4>Python (Requests)</h4>
              <pre className="code-block">
{`import requests

headers = {
    'Authorization': 'Bearer ${token.substring(0, 20)}...',
    'Content-Type': 'application/json'
}

response = requests.get('${apiUrl}/pacientes', headers=headers)
print(response.json())`}
              </pre>
            </div>
          </div>

          <div className="card info-card">
            <h3>Informações Importantes</h3>
            <ul>
              <li>
                <strong>Validade:</strong> O token é válido por 24 horas após o login
              </li>
              <li>
                <strong>Segurança:</strong> Nunca compartilhe seu token em repositórios públicos ou logs
              </li>
              <li>
                <strong>Renovação:</strong> Para obter um novo token, faça logout e login novamente
              </li>
              <li>
                <strong>Formato:</strong> O token deve ser enviado no header Authorization como "Bearer {'{token}'}"
              </li>
              <li>
                <strong>Endpoints:</strong> Todos os endpoints (exceto /api/auth/login) requerem autenticação
              </li>
              <li>
                <strong>Documentação:</strong> Consulte a página "API Docs" para lista completa de endpoints
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ChaveAPI;
