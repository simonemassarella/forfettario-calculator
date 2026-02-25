'use client';

import React from 'react';
import { CalculationInput } from '@/lib/calculator';

interface CalculatorFormProps {
  input: CalculationInput;
  onInputChange: (input: CalculationInput) => void;
}

export default function CalculatorForm({ input, onInputChange }: CalculatorFormProps) {
  const handleInputChange = (field: keyof CalculationInput, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    onInputChange({
      ...input,
      [field]: field === 'codiceAteco' ? value : numValue,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dati Calcolo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fatturato Mensile */}
        <div>
          <label htmlFor="fatturato" className="block text-sm font-medium text-gray-700 mb-2">
            Fatturato Mensile (€)
          </label>
          <input
            type="number"
            id="fatturato"
            value={input.fatturatoMensile || ''}
            onChange={(e) => handleInputChange('fatturatoMensile', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        {/* Codice ATECO */}
        <div>
          <label htmlFor="ateco" className="block text-sm font-medium text-gray-700 mb-2">
            Codice ATECO (opzionale)
          </label>
          <input
            type="text"
            id="ateco"
            value={input.codiceAteco || ''}
            onChange={(e) => handleInputChange('codiceAteco', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Es. 62.01.01"
          />
        </div>

        {/* Coefficiente di Redditività */}
        <div>
          <label htmlFor="redditivita" className="block text-sm font-medium text-gray-700 mb-2">
            Coefficiente di Redditività (%)
          </label>
          <div className="relative">
            <input
              type="number"
              id="redditivita"
              value={(input.coefficienteRedditivita * 100) || ''}
              onChange={(e) => handleInputChange('coefficienteRedditivita', parseFloat(e.target.value) / 100)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="78"
              step="0.01"
              min="0"
              max="100"
            />
            <span className="absolute right-3 top-2 text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Default: 78% per la maggior parte delle attività</p>
        </div>

        {/* Aliquota Imposta Sostitutiva */}
        <div>
          <label htmlFor="imposta" className="block text-sm font-medium text-gray-700 mb-2">
            Aliquota Imposta Sostitutiva (%)
          </label>
          <div className="relative">
            <input
              type="number"
              id="imposta"
              value={(input.aliquotaImpostaSostitutiva * 100) || ''}
              onChange={(e) => handleInputChange('aliquotaImpostaSostitutiva', parseFloat(e.target.value) / 100)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="5"
              step="0.01"
              min="0"
              max="100"
            />
            <span className="absolute right-3 top-2 text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Default: 5% per regime forfettario</p>
        </div>

        {/* Ore Lavorate Mensili */}
        <div>
          <label htmlFor="ore" className="block text-sm font-medium text-gray-700 mb-2">
            Ore Lavorate Mensili
          </label>
          <input
            type="number"
            id="ore"
            value={input.oreLavorateMensili || 138}
            onChange={(e) => handleInputChange('oreLavorateMensili', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="138"
            step="1"
            min="1"
          />
          <p className="text-xs text-gray-500 mt-1">Default: 138 ore (circa 35h/settimana)</p>
        </div>

        {/* Aliquota Contributi Previdenziali */}
        <div>
          <label htmlFor="contributi" className="block text-sm font-medium text-gray-700 mb-2">
            Aliquota Contributi Previdenziali GS INPS (%)
          </label>
          <div className="relative">
            <input
              type="number"
              id="contributi"
              value={(input.aliquotaContributiPrevidenziali * 100) || ''}
              onChange={(e) => handleInputChange('aliquotaContributiPrevidenziali', parseFloat(e.target.value) / 100)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="26.07"
              step="0.01"
              min="0"
              max="100"
            />
            <span className="absolute right-3 top-2 text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Default: 26,07% per Gestione Separata</p>
        </div>
      </div>
    </div>
  );
}
