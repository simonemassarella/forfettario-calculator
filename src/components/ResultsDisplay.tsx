'use client';

import React from 'react';
import { CalculationResult, formatCurrency, formatPercentage } from '@/lib/calculator';

interface ResultsDisplayProps {
  results: CalculationResult | null;
  onExportPDF?: () => void;
}

export default function ResultsDisplay({ results, onExportPDF }: ResultsDisplayProps) {
  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">Inserisci i dati per vedere i risultati del calcolo</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Riepilogo Principale */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Risultati Calcolo</h2>
          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Esporta PDF
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Reddito Imponibile */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Reddito Imponibile</h3>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(results.redditoImponibile)}</p>
          </div>

          {/* Netto Mensile Reale */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-1">Netto Mensile Reale</h3>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(results.nettoMensileReale)}</p>
          </div>

          {/* Netto Disponibile */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800 mb-1">Netto Mensile Reale</h3>
            <p className="text-2xl font-bold text-purple-900">{formatCurrency(results.nettoDisponibile)}</p>
            <p className="text-xs text-purple-700 mt-1">Dopo tasse e contributi</p>
          </div>
          
          {/* Netto dopo accantonamento effettivo */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-800 mb-1">Netto Spendibile Mensile</h3>
            <p className="text-2xl font-bold text-orange-900">{formatCurrency(results.nettoDopoAccantonamentoEffettivo)}</p>
            <p className="text-xs text-orange-700 mt-1">Dopo accantonamento 40% per tasse</p>
            {results.tariffaOrariaSpendibile && (
              <p className="text-xs text-orange-600 mt-1">
                {formatCurrency(results.tariffaOrariaSpendibile)}/ora
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dettaglio Tasse e Contributi */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Dettaglio Tasse e Contributi</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-600">Reddito Imponibile</span>
            <span className="font-semibold">{formatCurrency(results.redditoImponibile)}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <span className="text-gray-600">Imposta Sostitutiva</span>
              <span className="text-sm text-gray-500 ml-2">(5%)</span>
            </div>
            <span className="font-semibold text-red-600">{formatCurrency(results.impostaSostitutiva)}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <span className="text-gray-600">Contributi Previdenziali GS INPS</span>
              <span className="text-sm text-gray-500 ml-2">(26,07%)</span>
            </div>
            <span className="font-semibold text-orange-600">{formatCurrency(results.contributiPrevidenziali)}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-800 font-medium">Totale Tasse e Contributi</span>
            <span className="font-bold text-red-700">{formatCurrency(results.totaleTasseContributi)}</span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600">Percentuale Tasse/Contributi sul Fatturato</span>
            <span className="font-semibold">{formatPercentage(results.percentualeTasseContributi)}</span>
          </div>
        </div>
      </div>

      {/* Accantonamenti */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Accantonamenti Fiscali</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Accantonamento Totale</h4>
              <p className="text-xl font-bold text-yellow-900">{formatCurrency(results.redditoImponibile * 0.4)}</p>
              <p className="text-sm text-yellow-700 mt-1">{formatPercentage(results.percentualeDaAccantonare)} del fatturato</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-orange-800 mb-1">Saldo (Giugno)</h4>
              <p className="text-lg font-bold text-orange-900">{formatCurrency(results.accantonamentoSaldo)}</p>
              <p className="text-xs text-orange-700 mt-1">60% dell'accantonamento</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 mb-1">Acconti (Novembre)</h4>
              <p className="text-lg font-bold text-red-900">{formatCurrency(results.accantonamentoAcconti)}</p>
              <p className="text-xs text-red-700 mt-1">40% dell'accantonamento</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Nota:</strong> È consigliabile accantonare circa il 40% del fatturato mensile per coprire il saldo delle imposte (giugno) e gli acconti (novembre).
          </p>
        </div>
      </div>

      {/* Grafico Comparativo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Riepilogo Visivo</h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Fatturato</span>
              <span className="font-medium">{formatCurrency(results.redditoImponibile / 0.78)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Tasse e Contributi</span>
              <span className="font-medium">{formatCurrency(results.totaleTasseContributi)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-red-600 h-3 rounded-full" 
                style={{ width: `${Math.min(results.percentualeTasseContributi, 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Netto Reale</span>
              <span className="font-medium">{formatCurrency(results.nettoMensileReale)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full" 
                style={{ width: `${Math.max(0, 100 - results.percentualeTasseContributi)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Netto dopo Accantonamento 40%</span>
              <span className="font-medium">{formatCurrency(results.nettoDopoAccantonamentoEffettivo)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-orange-600 h-3 rounded-full" 
                style={{ width: `${Math.max(0, 100 - results.percentualeTasseContributi - 40)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Calcolo Orario */}
      {(results.tariffaOrariaNetta || results.tariffaOrariaSpendibile) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Analisi Oraria</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">Tariffa Oraria Netta</h4>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(results.tariffaOrariaNetta || 0)}
              </p>
              <p className="text-xs text-green-700 mt-1">Dopo tasse e contributi</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-orange-800 mb-2">Tariffa Oraria Spendibile</h4>
              <p className="text-2xl font-bold text-orange-900">
                {formatCurrency(results.tariffaOrariaSpendibile || 0)}
              </p>
              <p className="text-xs text-orange-700 mt-1">Dopo accantonamento tasse</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Giorni Settimanali</h4>
              <p className="text-xl font-bold text-blue-900">{results.giorniLavorativiSettimanali}</p>
              <p className="text-xs text-blue-700 mt-1">giorni/settimana</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Giorni Mensili</h4>
              <p className="text-xl font-bold text-blue-900">{results.giorniLavorativi}</p>
              <p className="text-xs text-blue-700 mt-1">giorni/mese</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Ore Giornaliere</h4>
              <p className="text-xl font-bold text-blue-900">{results.oreGiornaliere}</p>
              <p className="text-xs text-blue-700 mt-1">ore/giorno</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Ore Totali</h4>
              <p className="text-xl font-bold text-blue-900">{results.oreLavorateTotali}</p>
              <p className="text-xs text-blue-700 mt-1">ore/mese</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Esempio pratico:</strong> Con {results.oreLavorateTotali} ore lavorative ({results.giorniLavorativi} giorni × {results.oreGiornaliere} ore/giorno), 
              accantonando il 40% del fatturato per le tasse, ti rimangono {formatCurrency(results.nettoDopoAccantonamentoEffettivo)} spendibili, 
              equivalenti a {formatCurrency(results.tariffaOrariaSpendibile || 0)}/ora.
              <br /><br />
              <strong>Importante:</strong> L'accantonamento si calcola sempre sul fatturato, non sul netto!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
