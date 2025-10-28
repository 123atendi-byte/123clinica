import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import Medicos from './pages/Medicos';
import Agendamento from './pages/Agendamento';
import Agenda from './pages/Agenda';
import AgendaMedicos from './pages/AgendaMedicos';
import ApiDocs from './pages/ApiDocs';
import ChaveAPI from './pages/ChaveAPI';
import ChangePassword from './pages/ChangePassword';
import Layout from './components/Layout';
import './App.css';

const PrivateRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="medicos" element={<Medicos />} />
          <Route path="agendamento" element={<Agendamento />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="agenda-medicos" element={<AgendaMedicos />} />
          <Route path="api-docs" element={<ApiDocs />} />
          <Route path="chave-api" element={<ChaveAPI />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
