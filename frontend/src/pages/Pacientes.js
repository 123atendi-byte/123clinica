import React, { useState, useEffect } from 'react';
import { pacientesService } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import './Pacientes.css';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    data_nascimento: '',
    endereco: '',
  });

  useEffect(() => {
    loadPacientes();
  }, []);

  const loadPacientes = async () => {
    try {
      const response = await pacientesService.getAll();
      setPacientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPaciente) {
        await pacientesService.update(editingPaciente.id, formData);
      } else {
        await pacientesService.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadPacientes();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar paciente');
    }
  };

  const handleEdit = (paciente) => {
    setEditingPaciente(paciente);
    setFormData(paciente);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      try {
        await pacientesService.delete(id);
        loadPacientes();
      } catch (error) {
        alert('Erro ao excluir paciente');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      data_nascimento: '',
      endereco: '',
    });
    setEditingPaciente(null);
  };

  const handleCpfChange = (e) => {
    // Remove tudo que não é número
    const value = e.target.value.replace(/\D/g, '');
    // Limita a 11 dígitos
    const cpf = value.substring(0, 11);
    setFormData({ ...formData, cpf });
  };

  const filteredPacientes = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpf.includes(searchTerm)
  );

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="pacientes">
      <div className="page-header">
        <h1>Pacientes</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <FaPlus /> Novo Paciente
        </button>
      </div>

      <div className="card">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="input"
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPacientes.map((paciente) => (
                <tr key={paciente.id}>
                  <td>{paciente.nome}</td>
                  <td>{paciente.cpf}</td>
                  <td>{paciente.telefone}</td>
                  <td>{paciente.email}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(paciente)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(paciente.id)}
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPaciente ? 'Editar Paciente' : 'Novo Paciente'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Nome Completo *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">CPF * (somente números)</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.cpf}
                    onChange={handleCpfChange}
                    placeholder="12345678900"
                    maxLength="11"
                    required
                  />
                  <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {formData.cpf.length}/11 dígitos
                  </small>
                </div>

                <div className="form-group">
                  <label className="label">Data de Nascimento</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Telefone</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Endereço</label>
                <input
                  type="text"
                  className="input"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPaciente ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pacientes;
