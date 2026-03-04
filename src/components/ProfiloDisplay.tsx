'use client';

import React from 'react';
import { PROFILO_PREDEFINITO } from '@/lib/calculator';

export default function ProfiloDisplay() {
  const profilo = PROFILO_PREDEFINITO;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        👤 Profilo Professionale
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Nome Attività</span>
            <p className="text-sm font-medium text-gray-900">{profilo.nomeAttivita}</p>
          </div>
          
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Partita IVA</span>
            <p className="text-sm font-medium text-gray-900">{profilo.partitaIva}</p>
          </div>
          
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Codice Fiscale</span>
            <p className="text-sm font-medium text-gray-900">{profilo.codiceFiscale}</p>
          </div>
          
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Codice ATECO</span>
            <p className="text-sm font-medium text-gray-900">{profilo.codiceAteco}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Regime Fiscale</span>
            <p className="text-sm font-medium text-gray-900">{profilo.regime}</p>
          </div>
          
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Cassa Previdenziale</span>
            <p className="text-sm font-medium text-gray-900">
              {profilo.cassaPrevidenziale} (Matr. {profilo.matricola})
            </p>
          </div>
          
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Imposta Sostitutiva</span>
            <p className="text-sm font-medium text-gray-900">{profilo.impostaSostitutiva}%</p>
          </div>
          
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Coeff. Redditività</span>
            <p className="text-sm font-medium text-gray-900">{profilo.coefficienteRedditivita}%</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Inizio Attività: {profilo.dataInizioAttivita}</span>
          <span>Iscrizione: {profilo.dataIscrizione}</span>
        </div>
      </div>
    </div>
  );
}
