import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DTEList from './pages/DTEList';
import DTECreate from './pages/DTECreate';
import ComprasList from './pages/ComprasList';
import ComprasCreate from './pages/ComprasCreate';
import Recordatorios from './pages/Recordatorios';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />

        {/* Rutas de DTEs */}
        <Route path="facturas" element={<DTEList tipo={33} />} />
        <Route path="facturas/crear" element={<DTECreate tipo={33} />} />
        <Route path="boletas" element={<DTEList tipo={39} />} />
        <Route path="boletas/crear" element={<DTECreate tipo={39} />} />
        <Route path="notas-credito" element={<DTEList tipo={61} />} />
        <Route path="notas-credito/crear" element={<DTECreate tipo={61} />} />

        {/* Rutas de Compras */}
        <Route path="compras" element={<ComprasList />} />
        <Route path="compras/crear" element={<ComprasCreate />} />

        {/* Rutas de Recordatorios */}
        <Route path="recordatorios" element={<Recordatorios />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
