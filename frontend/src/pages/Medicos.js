import React, { useState, useEffect } from 'react';
import { medicosService } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import './Pacientes.css';

const Medicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMedico, setEditingMedico] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    crm: '',
    especialidade: '',
    telefone: '',
    email: '',
  });

  useEffect(() => {
    loadMedicos();
  }, []);

  const loadMedicos = async () => {
    try {
      const response = await medicosService.getAll();
      setMedicos(response.data);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMedico) {
        await medicosService.update(editingMedico.id, formData);
      } else {
        await medicosService.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadMedicos();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar médico');
    }
  };

  const handleEdit = (medico) => {
    setEditingMedico(medico);
    setFormData(medico);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este médico?')) {
      try {
        await medicosService.delete(id);
        loadMedicos();
      } catch (error) {
        alert('Erro ao excluir médico');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      crm: '',
      especialidade: '',
      telefone: '',
      email: '',
    });
    setEditingMedico(null);
  };

  const filteredMedicos = medicos.filter((m) =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.crm.includes(searchTerm) ||
    m.especialidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="pacientes">
      <div className="page-header">
        <h1>Médicos</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <FaPlus /> Novo Médico
        </button>
      </div>

      <div className="card">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="input"
            placeholder="Buscar por nome, CRM ou especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CRM</th>
                <th>Especialidade</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicos.map((medico) => (
                <tr key={medico.id}>
                  <td>{medico.nome}</td>
                  <td>{medico.crm}</td>
                  <td>{medico.especialidade}</td>
                  <td>{medico.telefone}</td>
                  <td>{medico.email}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(medico)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(medico.id)}
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
              <h2>{editingMedico ? 'Editar Médico' : 'Novo Médico'}</h2>
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
                  <label className="label">CRM *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.crm}
                    onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Especialidade *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.especialidade}
                    onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                    required
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

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMedico ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicos;
