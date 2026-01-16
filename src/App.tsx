import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { InventoryPage } from './pages/InventoryPage';
import { AddPage } from './pages/AddPage';
import { StatsPage } from './pages/StatsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<InventoryPage />} />
            <Route path="/add" element={<AddPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
