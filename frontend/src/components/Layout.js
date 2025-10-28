import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { FaCalendarAlt, FaUsers, FaHome, FaSignOutAlt, FaUserMd, FaCalendarCheck, FaClock, FaBook, FaKey } from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Clínica Sistema</h2>
          <p className="user-name">{user?.nome}</p>
        </div>

        <ul className="nav-menu">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              <FaHome /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/pacientes" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaUsers /> Pacientes
            </NavLink>
          </li>
          <li>
            <NavLink to="/medicos" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaUserMd /> Médicos
            </NavLink>
          </li>
          <li>
            <NavLink to="/agenda" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaCalendarCheck /> Agenda
            </NavLink>
          </li>
          <li>
            <NavLink to="/agendamento" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaCalendarAlt /> Novo Agendamento
            </NavLink>
          </li>
          <li>
            <NavLink to="/agenda-medicos" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaClock /> Horários Médicos
            </NavLink>
          </li>
          <li>
            <NavLink to="/api-docs" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaBook /> API Docs
            </NavLink>
          </li>
          <li>
            <NavLink to="/chave-api" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaKey /> Chave API
            </NavLink>
          </li>
        </ul>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Sair
        </button>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
