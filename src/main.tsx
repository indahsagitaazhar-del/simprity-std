import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Terapkan dark mode sebelum React render agar tidak ada flash of white screen
if (localStorage.getItem('simprity_dark') === 'true') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(<App />);
