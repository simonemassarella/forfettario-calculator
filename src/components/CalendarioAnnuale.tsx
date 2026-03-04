'use client';

import React from 'react';
import { getDettaglioGiorniLavorativiMese, calculateForfettario } from '@/lib/calculator';

interface CalendarioAnnualeProps {
  giorniSettimanali: number;
  inputBase: any; // Input base per i calcoli
}

export default function CalendarioAnnuale({ giorniSettimanali, inputBase }: CalendarioAnnualeProps) {
  const annoCorrente = new Date().getFullYear();
  const mesi = [];

  // Calcola giorni lavorativi e economici per ogni mese
  for (let mese = 0; mese < 12; mese++) {
    const dettaglio = getDettaglioGiorniLavorativiMese(giorniSettimanali, annoCorrente, mese);
    
    // Calcola economicità del mese con tutti i parametri correnti
    const inputMese = {
      ...inputBase,
      giorniLavorativiMensili: dettaglio.giorniLavorativi,
      oreLavorateMensili: dettaglio.giorniLavorativi * (inputBase.oreLavorativeGiornaliere || 8),
      modalitaCalcolo: 'giorniOre',
      // Assicuriamoci che tutti i parametri fiscali siano presenti
      coefficienteRedditivita: inputBase.coefficienteRedditivita || 0.78,
      aliquotaImpostaSostitutiva: inputBase.aliquotaImpostaSostitutiva || 0.05,
      aliquotaContributiPrevidenziali: inputBase.aliquotaContributiPrevidenziali || 0.2607,
      codiceAteco: inputBase.codiceAteco || '74.12.01',
    };
    
    // Calcola il fatturato corretto in base alla modalità e ai giorni lavorativi reali
    let fatturatoMese = 0;
    if (inputBase.modalitaCalcolo === 'tariffaOraria' && inputBase.tariffaOrariaDesiderata) {
      fatturatoMese = dettaglio.giorniLavorativi * (inputBase.oreLavorativeGiornaliere || 8) * inputBase.tariffaOrariaDesiderata;
    } else if (inputBase.modalitaCalcolo === 'oreTotali' && inputBase.oreLavorateMensili) {
      // Calcola tariffa oraria dal fatturato base e applica ai giorni reali
      const tariffaOraria = (inputBase.fatturatoMensile || 4400) / (inputBase.oreLavorateMensili || 160);
      // Usa i giorni lavorativi reali invece di quelli base
      const oreMeseReali = dettaglio.giorniLavorativi * (inputBase.oreLavorativeGiornaliere || 8);
      fatturatoMese = oreMeseReali * tariffaOraria;
    } else {
      // Modalità giorniOre - calcola in base ai giorni lavorativi reali
      const giorniBase = inputBase.giorniLavorativiMensili || 22;
      const fatturatoBase = inputBase.fatturatoMensile || 4400;
      const fatturatoPerGiorno = fatturatoBase / giorniBase;
      fatturatoMese = dettaglio.giorniLavorativi * fatturatoPerGiorno;
    }
    
    // Se il fatturato è 0, usiamo un valore di default per evitare problemi
    if (fatturatoMese === 0) {
      fatturatoMese = dettaglio.giorniLavorativi * (inputBase.oreLavorativeGiornaliere || 8) * 25; // 25€/h default
    }
    
    // Aggiorna l'input con il fatturato corretto per questo mese
    inputMese.fatturatoMensile = fatturatoMese;
    
    const risultatoMese = calculateForfettario(inputMese);
    
    mesi.push({
      ...dettaglio,
      fatturatoLordo: fatturatoMese || 0,
      nettoMensile: risultatoMese?.nettoMensileReale || 0,
      nettoSpendibile: risultatoMese?.nettoDopoAccantonamentoEffettivo || 0
    });
  }

  const totaleAnnuale = mesi.reduce((sum, mese) => sum + (mese?.giorniLavorativi || 0), 0);
  const fatturatoAnnuale = mesi.reduce((sum, mese) => sum + (mese?.fatturatoLordo || 0), 0);
  const nettoAnnuale = mesi.reduce((sum, mese) => sum + (mese?.nettoMensile || 0), 0);
  const nettoSpendibileAnnuale = mesi.reduce((sum, mese) => sum + (mese?.nettoSpendibile || 0), 0);

  // Funzione sicura per formattare valori numerici
  const formatNumber = (num: number) => {
    return isNaN(num) || !isFinite(num) ? 0 : Math.round(num);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200 w-full overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        📅 Calendario Lavorativo {annoCorrente}
      </h3>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs text-blue-700 font-medium mb-2">Configurazione</div>
            <div className="text-lg font-bold text-blue-900">{formatNumber(giorniSettimanali)} gg/sett</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-green-700 font-medium mb-2">Netto Annuale</div>
            <div className="text-lg font-bold text-green-900">€{formatNumber(nettoAnnuale).toLocaleString('it-IT')}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-blue-700 font-medium mb-2">Media Mensile</div>
            <div className="text-lg font-bold text-blue-900">€{formatNumber(nettoAnnuale / 12).toLocaleString('it-IT')}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-purple-700 font-medium mb-2">Giorni Lavorativi</div>
            <div className="text-lg font-bold text-purple-900">{formatNumber(totaleAnnuale)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mesi.map((mese, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg border transition-all ${
              index === new Date().getMonth() 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 bg-white hover:shadow-sm'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-800 text-base">
                {mese.nomeMese}
              </h4>
              {index === new Date().getMonth() && (
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium ml-2">
                  Corrente
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-xs text-gray-600 font-medium mb-1">Giorni lavorativi</div>
                <div className="text-sm font-bold text-green-600">{formatNumber(mese.giorniLavorativi)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 font-medium mb-1">Fatturato</div>
                <div className="text-sm font-bold text-blue-600">€{formatNumber(mese.fatturatoLordo).toLocaleString('it-IT')}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 font-medium mb-1">Netto</div>
                <div className="text-sm font-bold text-green-700">€{formatNumber(mese.nettoMensile).toLocaleString('it-IT')}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 font-medium mb-1">Spendibile</div>
                <div className="text-sm font-bold text-purple-600">€{formatNumber(mese.nettoSpendibile).toLocaleString('it-IT')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-bold text-gray-800 mb-4 text-base flex items-center">
          📊 Riepilogo Economico Annuale
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600 font-medium mb-2">Fatturato Lordo</div>
            <div className="text-xl font-bold text-blue-600">
              €{formatNumber(fatturatoAnnuale).toLocaleString('it-IT')}
            </div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600 font-medium mb-2">Netto Annuale</div>
            <div className="text-xl font-bold text-green-600">
              €{formatNumber(nettoAnnuale).toLocaleString('it-IT')}
            </div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600 font-medium mb-2">Spendibile Annuo</div>
            <div className="text-xl font-bold text-purple-600">
              €{formatNumber(nettoSpendibileAnnuale).toLocaleString('it-IT')}
            </div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600 font-medium mb-2">% Netto su Lordo</div>
            <div className="text-xl font-bold text-orange-600">
              {formatNumber((nettoAnnuale / fatturatoAnnuale) * 100)}%
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 text-sm">💡</span>
          <div className="text-sm text-blue-800">
            <strong>Configurazione attuale:</strong> {giorniSettimanali} giorni lavorativi settimanali e {(inputBase.oreLavorativeGiornaliere || 8)} ore giornaliere. 
            I valori mensili si adattano automaticamente ai giorni lavorativi reali di ogni mese.
          </div>
        </div>
      </div>
    </div>
  );
}
