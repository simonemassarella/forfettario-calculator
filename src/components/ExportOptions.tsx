'use client';

import React, { useState } from 'react';
import { CalculationInput, CalculationResult, generaTestoRiepilogo, generaEmailSemplificata } from '@/lib/calculator';

interface ExportOptionsProps {
  input: CalculationInput;
  results: CalculationResult;
}

export default function ExportOptions({ input, results }: ExportOptionsProps) {
  const [showTextModal, setShowTextModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copied, setCopied] = useState('');

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Errore nella copia:', err);
    }
  };

  const downloadAsTxt = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const testoCompleto = generaTestoRiepilogo(input, results);
  const testoEmail = generaEmailSemplificata(input, results);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📤 Esporta Risultati</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opzioni Testo Completo */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Report Dettagliato</h4>
          
          <button
            onClick={() => setShowTextModal(!showTextModal)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            👁️ Anteprima Testo
          </button>
          
          <button
            onClick={() => copyToClipboard(testoCompleto, 'completo')}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {copied === 'completo' ? '✅ Copiato!' : '📋 Copia negli Appunti'}
          </button>
          
          <button
            onClick={() => downloadAsTxt(testoCompleto, `calcolo-forfettario-${new Date().toISOString().split('T')[0]}.txt`)}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            💾 Scarica come TXT
          </button>
        </div>

        {/* Opzioni Email */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Email Rapida</h4>
          
          <button
            onClick={() => setShowEmailModal(!showEmailModal)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            👁️ Anteprima Email
          </button>
          
          <button
            onClick={() => copyToClipboard(testoEmail, 'email')}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {copied === 'email' ? '✅ Copiato!' : '📧 Copia Email'}
          </button>
          
          <a
            href={`mailto:?subject=Calcolo Reddito Forfettario&body=${encodeURIComponent(testoEmail)}`}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors inline-block text-center"
          >
            📧 Apri Client Email
          </a>
        </div>
      </div>

      {/* Modal Anteprima Testo Completo */}
      {showTextModal && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-800">Anteprima Report Dettagliato</h4>
            <button
              onClick={() => setShowTextModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border border-gray-300 max-h-96 overflow-y-auto">
            {testoCompleto}
          </pre>
        </div>
      )}

      {/* Modal Anteprima Email */}
      {showEmailModal && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-800">Anteprima Email</h4>
            <button
              onClick={() => setShowEmailModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border border-gray-300">
            {testoEmail}
          </div>
        </div>
      )}
    </div>
  );
}
