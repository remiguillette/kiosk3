import { Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage.jsx';
import BeaverPhonePage from './pages/BeaverPhonePage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/beaverphone" element={<BeaverPhonePage />} />
    </Routes>
  );
}

export default App;
