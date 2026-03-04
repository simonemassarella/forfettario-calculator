'use client';

import React, { useState, useEffect } from 'react';
import CalculatorForm from '@/components/CalculatorForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import SavedCalculations from '@/components/SavedCalculations';
import ExportOptions from '@/components/ExportOptions';
import { CalculationInput, CalculationResult, calculateForfettario } from '@/lib/calculator';
import { saveCalculation, getCalculations } from '@/lib/storage';
import { exportToPDF, downloadJSON } from '@/lib/pdfExport';

export default function Home() {
  const [input, setInput] = useState<CalculationInput>({
    fatturatoMensile: 0,
    codiceAteco: '',
    coefficienteRedditivita: 0.78,
    aliquotaImpostaSostitutiva: 0.05,
    aliquotaContributiPrevidenziali: 0.2607,
    modalitaCalcolo: 'oreTotali',
    oreLavorateMensili: 138,
    giorniLavorativiMensili: 22,
    oreLavorativeGiornaliere: 8,
    giorniLavorativiSettimanali: 5,
    tariffaOrariaDesiderata: 0,
    serviziInclusi: {
      uxui: true,
      frontend: true,
      htmlcss: true
    }
  });

  const [results, setResults] = useState<CalculationResult | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const savedCalculations = getCalculations();
    if (savedCalculations.length > 0) {
      const latest = savedCalculations[savedCalculations.length - 1];
      setInput(latest.input);
      setResults(latest.results);
    }
  }, []);

  useEffect(() => {
    if (input.fatturatoMensile > 0) {
      const calculatedResults = calculateForfettario(input);
      setResults(calculatedResults);
    } else {
      setResults(null);
    }
  }, [input]);

  const handleInputChange = (newInput: CalculationInput) => {
    setInput(newInput);
  };

  const handleSaveCalculation = () => {
    if (results) {
      const name = prompt('Inserisci un nome per questo calcolo:', `Calcolo del ${new Date().toLocaleDateString('it-IT')}`);
      if (name) {
        saveCalculation(input, results, name);
        alert('Calcolo salvato con successo!');
      }
    }
  };

  const handleLoadCalculation = (loadedInput: CalculationInput, loadedResults: CalculationResult) => {
    setInput(loadedInput);
    setResults(loadedResults);
    setShowSaved(false);
  };

  const handleExportPDF = async () => {
    if (results) {
      try {
        await exportToPDF(input, results, 'results-container');
      } catch (error) {
        console.error('Errore durante l\'esportazione PDF:', error);
        alert('Errore durante l\'esportazione del PDF. Riprova più tardi.');
      }
    }
  };

  const handleExportJSON = () => {
    if (results) {
      downloadJSON(input, results);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calcolo Regime Forfettario</h1>
              <p className="text-sm text-gray-600 mt-1">Calcola il netto reale per freelance in regime forfettario</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaved(!showSaved)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showSaved 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showSaved ? 'Nascondi' : 'Mostra'} Calcoli Salvati
              </button>
              {results && (
                <>
                  <button
                    onClick={handleSaveCalculation}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Salva Calcolo
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Esporta JSON
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <CalculatorForm input={input} onInputChange={handleInputChange} />
            <div id="results-container">
              <ResultsDisplay results={results} onExportPDF={handleExportPDF} />
            </div>
            {results && <ExportOptions input={input} results={results} />}
          </div>
          
          <div className="lg:col-span-1">
            {showSaved && (
              <SavedCalculations onLoadCalculation={handleLoadCalculation} />
            )}
            
            {/* Informazioni Utili */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Informazioni Utili</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Regime Forfettario</h4>
                  <p className="text-gray-600">
                    Il regime forfettario è un regime fiscale semplificato per freelance e piccole imprese con ricavi annui inferiori a €85.000.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Scadenze Fiscali</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• <strong>Giugno:</strong> Saldo imposte anno precedente</li>
                    <li>• <strong>Novembre:</strong> Primo acconto imposte anno corrente</li>
                    <li>• <strong>Dicembre:</strong> Secondo acconto (se dovuto)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Coefficienti di Redditività</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• <strong>78%:</strong> Lavoratori autonomi (default)</li>
                    <li>• <strong>67%:</strong> Professioni con cassa</li>
                    <li>• <strong>86%:</strong> Commercio</li>
                    <li>• <strong>40%:</strong> Altre attività</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 text-xs">
                    <strong>Importante:</strong> Il "Netto Spendibile" è ciò che rimane dopo aver accantonato il 40% del fatturato per le tasse. 
                    I calcoli definitivi vengono fatti in dichiarazione dei redditi, ma accantonare regolarmente ti evita sorprese!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
