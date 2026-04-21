import { useEffect } from 'react';
import { CalculationProvider, useCalculation } from './context/CalculationContext';
import { getPricingConfig } from './firebase/service';
import Home from './components/Home';
import './App.css';

// Runs once on mount — silently loads saved pricing from Firebase
// and overrides the static defaultPricing.js defaults if found
function PricingLoader() {
  const { loadPricing } = useCalculation();

  useEffect(() => {
    getPricingConfig()
      .then((config) => {
        if (config) loadPricing(config);
      })
      .catch((err) => {
        console.warn('Could not load pricing from Firebase:', err.message);
      });
  }, []);

  return null;
}

export default function App() {
  return (
    <CalculationProvider>
      <PricingLoader />
      <Home />
    </CalculationProvider>
  );
}
