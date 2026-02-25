import { CalculationInput, CalculationResult } from './calculator';

export interface SavedCalculation {
  id: string;
  date: string;
  input: CalculationInput;
  results: CalculationResult;
  name?: string;
}

const STORAGE_KEY = 'forfettario-calculations';

export function saveCalculation(
  input: CalculationInput,
  results: CalculationResult,
  name?: string
): SavedCalculation {
  const calculation: SavedCalculation = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    input,
    results,
    name: name || `Calcolo del ${new Date().toLocaleDateString('it-IT')}`,
  };

  const existingCalculations = getCalculations();
  existingCalculations.push(calculation);
  
  // Mantieni solo gli ultimi 50 calcoli
  if (existingCalculations.length > 50) {
    existingCalculations.splice(0, existingCalculations.length - 50);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingCalculations));
  return calculation;
}

export function getCalculations(): SavedCalculation[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Errore nel caricamento dei calcoli salvati:', error);
    return [];
  }
}

export function deleteCalculation(id: string): boolean {
  const calculations = getCalculations();
  const filteredCalculations = calculations.filter(calc => calc.id !== id);
  
  if (filteredCalculations.length < calculations.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCalculations));
    return true;
  }
  
  return false;
}

export function getCalculation(id: string): SavedCalculation | null {
  const calculations = getCalculations();
  return calculations.find(calc => calc.id === id) || null;
}

export function updateCalculationName(id: string, name: string): boolean {
  const calculations = getCalculations();
  const calculation = calculations.find(calc => calc.id === id);
  
  if (calculation) {
    calculation.name = name;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations));
    return true;
  }
  
  return false;
}
