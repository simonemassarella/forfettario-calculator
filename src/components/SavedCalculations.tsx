'use client';

import React, { useState, useEffect } from 'react';
import { SavedCalculation, getCalculations, deleteCalculation, updateCalculationName } from '@/lib/storage';
import { CalculationInput, CalculationResult } from '@/lib/calculator';

interface SavedCalculationsProps {
  onLoadCalculation: (input: CalculationInput, results: CalculationResult) => void;
}

export default function SavedCalculations({ onLoadCalculation }: SavedCalculationsProps) {
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    setCalculations(getCalculations());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo calcolo?')) {
      deleteCalculation(id);
      setCalculations(getCalculations());
    }
  };

  const handleEditName = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveName = (id: string) => {
    if (editingName.trim()) {
      updateCalculationName(id, editingName.trim());
      setCalculations(getCalculations());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (calculations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">Nessun calcolo salvato</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Calcoli Salvati</h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {calculations.map((calc) => (
          <div
            key={calc.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {editingId === calc.id ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveName(calc.id)}
                    />
                    <button
                      onClick={() => handleSaveName(calc.id)}
                      className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <h3 className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
                      onClick={() => calc.name && onLoadCalculation(calc.input, calc.results)}>
                    {calc.name}
                  </h3>
                )}
                
                <p className="text-sm text-gray-600 mb-2">{formatDate(calc.date)}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Fatturato:</span>
                    <span className="ml-1 font-medium">
                      €{calc.input.fatturatoMensile.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Netto:</span>
                    <span className="ml-1 font-medium text-green-600">
                      €{calc.results.nettoMensileReale.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tasse:</span>
                    <span className="ml-1 font-medium text-red-600">
                      €{calc.results.totaleTasseContributi.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Disponibile:</span>
                    <span className="ml-1 font-medium text-purple-600">
                      €{calc.results.nettoDisponibile.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => calc.name && handleEditName(calc.id, calc.name)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Modifica nome"
                >
                  ✏️
                </button>
                <button
                  onClick={() => calc.name && onLoadCalculation(calc.input, calc.results)}
                  className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                  title="Carica calcolo"
                >
                  📂
                </button>
                <button
                  onClick={() => handleDelete(calc.id)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  title="Elimina"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          {calculations.length} calcol{calculations.length === 1 ? 'o' : 'i'} salvati • Clicca sul nome per caricare un calcolo precedente
        </p>
      </div>
    </div>
  );
}
