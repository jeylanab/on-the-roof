import { CalculationProvider } from './context/CalculationContext';
import Home from './components/Home';
import './App.css';

export default function App() {
  return (
    <CalculationProvider>
      <Home />
    </CalculationProvider>
  );
}