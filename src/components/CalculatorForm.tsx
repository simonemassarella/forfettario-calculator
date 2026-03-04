'use client';

import React, { useState } from 'react';
import { CalculationInput, calcolaGiorniMensiliDaSettimanali } from '@/lib/calculator';

interface CalculatorFormProps {
  input: CalculationInput;
  onInputChange: (input: CalculationInput) => void;
}

// Componente riutilizzabile per pulsanti rapidi
function QuickButtons({ 
  options, 
  selected, 
  onSelect, 
  suffix = '' 
}: { 
  options: number[], 
  selected: number, 
  onSelect: (value: number) => void,
  suffix?: string 
}) {
  return (
    <div className="flex gap-2 mb-2">
      {options.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            selected === value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {value}{suffix}
        </button>
      ))}
    </div>
  );
}

// Componente riutilizzabile per campo giorni lavorativi
function GiorniLavorativiField({
  value,
  onChange,
  label,
  id,
  showQuickButtons = true,
  helpText
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  id: string;
  showQuickButtons?: boolean;
  helpText?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {showQuickButtons && (
        <QuickButtons
          options={[20, 22, 23]}
          selected={value}
          onSelect={onChange}
          suffix="gg"
        />
      )}
      <input
        type="number"
        id={id}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 22)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        placeholder="22"
        step="1"
        min="1"
        max="31"
      />
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
}

// Componente riutilizzabile per campo ore giornaliere
function OreGiornaliereField({
  value,
  onChange,
  label,
  id,
  helpText
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  id: string;
  helpText?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <QuickButtons
        options={[6, 7, 8, 9]}
        selected={value}
        onSelect={onChange}
        suffix="h"
      />
      <input
        type="number"
        id={id}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 8)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        placeholder="8"
        step="0.5"
        min="1"
        max="24"
      />
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
}

export default function CalculatorForm({ input, onInputChange }: CalculatorFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field: keyof CalculationInput, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    onInputChange({
      ...input,
      [field]: field === 'codiceAteco' ? value : numValue,
    });
  };

  const handleServiziChange = (servizio: keyof NonNullable<CalculationInput['serviziInclusi']>, checked: boolean) => {
    onInputChange({
      ...input,
      serviziInclusi: {
        uxui: input.serviziInclusi?.uxui ?? false,
        frontend: input.serviziInclusi?.frontend ?? false,
        htmlcss: input.serviziInclusi?.htmlcss ?? false,
        [servizio]: checked
      }
    });
  };

  const handleModalitaChange = (modalita: CalculationInput['modalitaCalcolo']) => {
    onInputChange({
      ...input,
      modalitaCalcolo: modalita,
    });
  };

  const handleGiorniSettimanaliChange = (giorniSettimanali: number) => {
    const giorniMensili = calcolaGiorniMensiliDaSettimanali(giorniSettimanali);
    onInputChange({
      ...input,
      giorniLavorativiSettimanali: giorniSettimanali,
      giorniLavorativiMensili: giorniMensili,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Calcolo Reddito Forfettario</h2>
        <p className="text-gray-600">Inserisci i dati per calcolare il tuo netto mensile</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fatturato Mensile */}
        <div className={input.modalitaCalcolo === 'tariffaOraria' ? 'md:col-span-2 opacity-50' : ''}>
          <label htmlFor="fatturato" className="block text-sm font-medium text-gray-700 mb-2">
            Fatturato Mensile (€)
            {input.modalitaCalcolo === 'tariffaOraria' && (
              <span className="text-xs text-orange-600 ml-2">(Calcolato automaticamente)</span>
            )}
          </label>
          <input
            type="number"
            id="fatturato"
            value={input.modalitaCalcolo === 'tariffaOraria' ? 
              ((input.tariffaOrariaDesiderata || 0) * ((input.giorniLavorativiMensili || 22) * (input.oreLavorativeGiornaliere || 8))).toFixed(2) : 
              input.fatturatoMensile}
            onChange={(e) => handleInputChange('fatturatoMensile', e.target.value)}
            disabled={input.modalitaCalcolo === 'tariffaOraria'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
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

        {/* Modalità Calcolo Ore */}
        <div className="md:col-span-2">
          <label className="block text-base font-semibold text-gray-800 mb-3">
            Scegli come calcolare le ore lavorative:
          </label>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleModalitaChange('oreTotali')}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  input.modalitaCalcolo === 'oreTotali'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Ore Totali
                <div className="text-xs mt-1">Inserisci direttamente le ore mensili</div>
              </button>
              <button
                type="button"
                onClick={() => handleModalitaChange('giorniOre')}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  input.modalitaCalcolo === 'giorniOre'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Giorni × Ore
                <div className="text-xs mt-1">Giorni lavorativi per ore al giorno</div>
              </button>
              <button
                type="button"
                onClick={() => handleModalitaChange('tariffaOraria')}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  input.modalitaCalcolo === 'tariffaOraria'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Da Tariffa Oraria
                <div className="text-xs mt-1">Calcola fatturato da tariffa oraria</div>
              </button>
            </div>
          </div>
        </div>

        {/* Campi dinamici basati sulla modalità */}
        {input.modalitaCalcolo === 'oreTotali' && (
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
        )}

        {(input.modalitaCalcolo === 'giorniOre' || input.modalitaCalcolo === 'tariffaOraria') && (
          <>
            {/* Giorni Lavorativi Settimanali */}
            <div>
              <label htmlFor="giorniSettimanali" className="block text-sm font-medium text-gray-700 mb-2">
                Giorni Lavorativi a Settimana
              </label>
              <QuickButtons
                options={[1, 2, 3, 4, 5]}
                selected={input.giorniLavorativiSettimanali || 5}
                onSelect={handleGiorniSettimanaliChange}
                suffix="gg"
              />
              <input
                type="number"
                id="giorniSettimanali"
                value={input.giorniLavorativiSettimanali || 5}
                onChange={(e) => handleGiorniSettimanaliChange(parseInt(e.target.value) || 5)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="5"
                step="1"
                min="1"
                max="7"
              />
              <p className="text-xs text-gray-500 mt-1">
                Calcola automaticamente {calcolaGiorniMensiliDaSettimanali(input.giorniLavorativiSettimanali || 5)} giorni al mese
              </p>
            </div>

            <GiorniLavorativiField
              value={input.giorniLavorativiMensili || 22}
              onChange={(value) => handleInputChange('giorniLavorativiMensili', value)}
              label="Giorni Lavorativi al Mese"
              id="giorni"
              helpText="Default: 22 giorni | Usa i pulsanti per selezioni rapide"
            />

            <OreGiornaliereField
              value={input.oreLavorativeGiornaliere || 8}
              onChange={(value) => handleInputChange('oreLavorativeGiornaliere', value)}
              label="Ore Lavorative al Giorno"
              id="oreGiornaliere"
              helpText="Default: 8 ore | Usa i pulsanti per selezioni rapide"
            />
          </>
        )}

        {input.modalitaCalcolo === 'tariffaOraria' && (
          <>
            <div>
              <label htmlFor="tariffaOraria" className="block text-lg font-semibold text-gray-800 mb-2 border-b-2 border-blue-500 pb-1">
                💰 Tariffa Oraria Desiderata (€)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="tariffaOraria"
                  value={input.tariffaOrariaDesiderata || ''}
                  onChange={(e) => handleInputChange('tariffaOrariaDesiderata', e.target.value)}
                  className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-semibold"
                  placeholder="25.00"
                  step="0.01"
                  min="0"
                />
                <span className="absolute right-3 top-3 text-gray-500 text-lg font-semibold">€/h</span>
              </div>
              <p className="text-sm text-blue-600 mt-2 font-medium">
                ⭐ Inserisci la tua tariffa oraria desiderata - Il calcolatore determinerà automaticamente il tuo fatturato mensile
              </p>
            </div>

            {/* Servizi Inclusi */}
            <div className="md:col-span-2">
              <label className="block text-base font-semibold text-gray-800 mb-3">
                🛠️ Servizi Inclusi nella Proposta
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={input.serviziInclusi?.uxui || false}
                      onChange={(e) => handleServiziChange('uxui', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">UX/UI Design in Figma</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={input.serviziInclusi?.frontend || false}
                      onChange={(e) => handleServiziChange('frontend', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Sviluppo Front-end</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={input.serviziInclusi?.htmlcss || false}
                      onChange={(e) => handleServiziChange('htmlcss', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">HTML/CSS</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Seleziona i servizi da includere nella proposta di collaborazione
                </p>
              </div>
            </div>
          </>
        )}

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

      {/* Riepilogo dinamico */}
      {input.modalitaCalcolo !== 'oreTotali' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Riepilogo Calcolo</h4>
          <div className="text-sm text-blue-700">
            {input.modalitaCalcolo === 'giorniOre' && (
              <p>
                <strong>Ore totali:</strong> {(input.giorniLavorativiMensili || 22)} giorni × {(input.oreLavorativeGiornaliere || 8)} ore = <strong>{((input.giorniLavorativiMensili || 22) * (input.oreLavorativeGiornaliere || 8))} ore/mese</strong>
              </p>
            )}
            {input.modalitaCalcolo === 'tariffaOraria' && input.tariffaOrariaDesiderata && (
              <div>
                <p className="mb-2">
                  <strong>Fatturato calcolato:</strong> {formatCurrency(input.tariffaOrariaDesiderata)} × {((input.giorniLavorativiMensili || 22) * (input.oreLavorativeGiornaliere || 8))} ore
                </p>
                <p className="text-lg font-bold text-blue-900">
                  = {formatCurrency(input.tariffaOrariaDesiderata * ((input.giorniLavorativiMensili || 22) * (input.oreLavorativeGiornaliere || 8)))} / mese
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
