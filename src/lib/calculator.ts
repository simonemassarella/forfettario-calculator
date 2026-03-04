export interface CalculationInput {
  fatturatoMensile: number;
  codiceAteco?: string;
  coefficienteRedditivita: number;
  aliquotaImpostaSostitutiva: number;
  aliquotaContributiPrevidenziali: number;
  // Modalità di calcolo ore
  modalitaCalcolo: 'oreTotali' | 'giorniOre' | 'tariffaOraria';
  oreLavorateMensili?: number;
  giorniLavorativiMensili?: number;
  oreLavorativeGiornaliere?: number;
  giorniLavorativiSettimanali?: number;
  tariffaOrariaDesiderata?: number;
  // Servizi inclusi nella proposta
  serviziInclusi?: {
    uxui: boolean;
    frontend: boolean;
    htmlcss: boolean;
  };
}

export interface CalculationResult {
  redditoImponibile: number;
  impostaSostitutiva: number;
  contributiPrevidenziali: number;
  totaleTasseContributi: number;
  nettoMensileReale: number;
  percentualeDaAccantonare: number;
  nettoDisponibile: number;
  nettoDopoAccantonamentoEffettivo: number;
  percentualeTasseContributi: number;
  accantonamentoSaldo: number;
  accantonamentoAcconti: number;
  tariffaOrariaNetta?: number;
  tariffaOrariaSpendibile?: number;
  oreLavorateTotali: number;
  giorniLavorativi: number;
  oreGiornaliere: number;
  giorniLavorativiSettimanali: number;
  fatturatoDaTariffaOraria?: number;
}

export function calculateForfettario(input: CalculationInput): CalculationResult {
  const {
    fatturatoMensile,
    coefficienteRedditivita,
    aliquotaImpostaSostitutiva,
    aliquotaContributiPrevidenziali,
    modalitaCalcolo,
    oreLavorateMensili = 138,
    giorniLavorativiMensili = 22,
    oreLavorativeGiornaliere = 8,
    giorniLavorativiSettimanali = 5,
    tariffaOrariaDesiderata,
    serviziInclusi = { uxui: true, frontend: true, htmlcss: true },
  } = input;

  // Calcolo ore totali in base alla modalità
  let oreTotali = oreLavorateMensili;
  let giorni = giorniLavorativiMensili;
  let oreGiornaliere = oreLavorativeGiornaliere;
  let giorniSettimanali = giorniLavorativiSettimanali;
  let fatturatoFinale = fatturatoMensile;

  switch (modalitaCalcolo) {
    case 'giorniOre':
      oreTotali = giorniLavorativiMensili * oreLavorativeGiornaliere;
      break;
    case 'tariffaOraria':
      if (tariffaOrariaDesiderata) {
        oreTotali = giorniLavorativiMensili * oreLavorativeGiornaliere;
        fatturatoFinale = tariffaOrariaDesiderata * oreTotali;
      }
      break;
    default:
      // 'oreTotali' - usa il valore diretto
      break;
  }

  // Calcolo reddito imponibile
  const redditoImponibile = fatturatoFinale * coefficienteRedditivita;

  // Calcolo imposta sostitutiva
  const impostaSostitutiva = redditoImponibile * aliquotaImpostaSostitutiva;

  // Calcolo contributi previdenziali
  const contributiPrevidenziali = redditoImponibile * aliquotaContributiPrevidenziali;

  // Totale tasse e contributi
  const totaleTasseContributi = impostaSostitutiva + contributiPrevidenziali;

  // Netto mensile reale
  const nettoMensileReale = fatturatoFinale - totaleTasseContributi;

  // Percentuale da accantonare (40% del fatturato)
  const percentualeDaAccantonare = 0.4;
  const accantonamentoTotale = fatturatoFinale * percentualeDaAccantonare;

  // Netto disponibile dopo accantonamento
  // Nota: il netto disponibile è il netto reale, l'accantonamento è solo una riserva
  const nettoDisponibile = nettoMensileReale;
  
  // Netto dopo accantonamento effettivo (se si decidesse di mettere da parte il 40% ogni mese)
  // Nota: l'accantonamento si calcola sul FATTURATO, non sul netto
  const nettoDopoAccantonamentoEffettivo = fatturatoFinale - accantonamentoTotale;

  // Percentuale tasse/contributi rispetto al fatturato
  const percentualeTasseContributi = (totaleTasseContributi / fatturatoFinale) * 100;

  // Divisione accantonamento tra saldo e acconti
  const accantonamentoSaldo = accantonamentoTotale * 0.6; // 60% per saldo (giugno)
  const accantonamentoAcconti = accantonamentoTotale * 0.4; // 40% per acconti (novembre)

  // Calcolo tariffe orarie
  const tariffaOrariaNetta = oreTotali > 0 ? nettoMensileReale / oreTotali : 0;
  const tariffaOrariaSpendibile = oreTotali > 0 ? nettoDopoAccantonamentoEffettivo / oreTotali : 0;

  // Calcolo fatturato da tariffa oraria (se in modalità tariffa)
  const fatturatoDaTariffaOraria = modalitaCalcolo === 'tariffaOraria' && tariffaOrariaDesiderata 
    ? tariffaOrariaDesiderata * oreTotali 
    : undefined;

  return {
    redditoImponibile,
    impostaSostitutiva,
    contributiPrevidenziali,
    totaleTasseContributi,
    nettoMensileReale,
    percentualeDaAccantonare: percentualeDaAccantonare * 100,
    nettoDisponibile,
    nettoDopoAccantonamentoEffettivo,
    percentualeTasseContributi,
    accantonamentoSaldo,
    accantonamentoAcconti,
    tariffaOrariaNetta,
    tariffaOrariaSpendibile,
    oreLavorateTotali: oreTotali,
    giorniLavorativi: giorni,
    oreGiornaliere: oreGiornaliere,
    giorniLavorativiSettimanali: giorniSettimanali,
    fatturatoDaTariffaOraria,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function calcolaGiorniMensiliDaSettimanali(giorniSettimanali: number): number {
  // Calcola giorni lavorativi mensili basati su giorni settimanali
  // Considerando circa 4.33 settimane in un mese (365/12/7)
  const settimanePerMese = 4.33;
  return Math.round(giorniSettimanali * settimanePerMese);
}

export function generaTestoRiepilogo(input: CalculationInput, result: CalculationResult): string {
  const data = new Date().toLocaleDateString('it-IT');
  
  let testo = `
CALCOLO REDDITO FORFETTARIO
Data: ${data}
==========================================

DATI DI INPUT:
• Fatturato Mensile: ${formatCurrency(result.fatturatoDaTariffaOraria || input.fatturatoMensile)}
• Modalità Calcolo: ${input.modalitaCalcolo === 'oreTotali' ? 'Ore Totali' : 
                     input.modalitaCalcolo === 'giorniOre' ? 'Giorni × Ore' : 'Da Tariffa Oraria'}
`;

  if (input.modalitaCalcolo !== 'oreTotali') {
    testo += `• Giorni Lavorativi Settimanali: ${result.giorniLavorativiSettimanali} giorni
• Giorni Lavorativi Mensili: ${result.giorniLavorativi} giorni
• Ore Lavorative Giornaliere: ${result.oreGiornaliere} ore
• Ore Totali Mensili: ${result.oreLavorateTotali} ore
`;
    if (input.modalitaCalcolo === 'tariffaOraria' && input.tariffaOrariaDesiderata) {
      testo += `• Tariffa Oraria Desiderata: ${formatCurrency(input.tariffaOrariaDesiderata)}/ora
`;
    }
  } else {
    testo += `• Ore Lavorate Mensili: ${result.oreLavorateTotali} ore
`;
  }

  testo += `
• Codice ATECO: ${input.codiceAteco || 'Non specificato'}
• Coefficiente Redditività: ${(input.coefficienteRedditivita * 100).toFixed(0)}%
• Aliquota Imposta Sostitutiva: ${(input.aliquotaImpostaSostitutiva * 100).toFixed(0)}%
• Aliquota Contributi Previdenziali: ${(input.aliquotaContributiPrevidenziali * 100).toFixed(2)}%

RISULTATI DEL CALCOLO:
==========================================
• Reddito Imponibile: ${formatCurrency(result.redditoImponibile)}
• Imposta Sostitutiva: ${formatCurrency(result.impostaSostitutiva)}
• Contributi Previdenziali: ${formatCurrency(result.contributiPrevidenziali)}
• Totale Tasse + Contributi: ${formatCurrency(result.totaleTasseContributi)}
• Netto Mensile Reale: ${formatCurrency(result.nettoMensileReale)}

ACCANTONAMENTO FISCALE (40% del fatturato):
==========================================
• Importo da Accantonare: ${formatCurrency(result.fatturatoDaTariffaOraria || input.fatturatoMensile * 0.40)}
• Netto Disponibile (prima accantonamento): ${formatCurrency(result.nettoDisponibile)}
• Netto dopo Accantonamento Effettivo: ${formatCurrency(result.nettoDopoAccantonamentoEffettivo)}

ANALISI ORARIA:
==========================================
`;

  if (result.tariffaOrariaNetta) {
    testo += `• Tariffa Oraria Netta (dopo tasse): ${formatCurrency(result.tariffaOrariaNetta)}/ora
`;
  }
  if (result.tariffaOrariaSpendibile) {
    testo += `• Tariffa Oraria Spendibile (dopo accantonamento): ${formatCurrency(result.tariffaOrariaSpendibile)}/ora
`;
  }

  testo += `
RIEPILOGO PERCENTUALI:
==========================================
• Percentuale Tasse + Contributi sul Fatturato: ${result.percentualeTasseContributi.toFixed(1)}%
• Percentuale Netto sul Fatturato: ${((result.nettoMensileReale / (result.fatturatoDaTariffaOraria || input.fatturatoMensile)) * 100).toFixed(1)}%
• Percentuale Accantonamento sul Fatturato: 40.0%

NOTE IMPORTANTI:
==========================================
• L'accantonamento del 40% è calcolato sul FATTURATO, non sul netto
• Si consiglia di mantenere sempre un fondo per il pagamento delle tasse
• I calcoli sono basati sul regime forfettario italiano
• Verificare sempre con un commercialista per valutazioni personalizzate

---
Generato con Calcolatore Forfettario
`;

  return testo.trim();
}

export function generaEmailSemplificata(input: CalculationInput, result: CalculationResult): string {
  const fatturato = result.fatturatoDaTariffaOraria || input.fatturatoMensile;
  const tariffaOraria = input.tariffaOrariaDesiderata || (fatturato / result.oreLavorateTotali);
  
  // Costruisci la descrizione dei servizi
  const servizi = [];
  if (input.serviziInclusi?.uxui) servizi.push('UX/UI design in Figma');
  if (input.serviziInclusi?.frontend) servizi.push('sviluppo front-end');
  if (input.serviziInclusi?.htmlcss) servizi.push('HTML/CSS');
  
  const descrizioneServizi = servizi.length > 0 ? servizi.join(', ') : 'sviluppo web';
  
  let testo = `Oggetto: Proposta collaborazione – UX/UI & Front-end

Buonasera,

come anticipato durante il colloquio, confermo il mio interesse a collaborare al vostro progetto.
In riferimento al ruolo che integra attività di ${descrizioneServizi}, propongo una tariffa di ${formatCurrency(tariffaOraria)}/h, con un impegno di ${result.giorniLavorativiSettimanali} giorni settimanali,`;

  // Aggiungi dettaglio organizzazione ore
  if (input.modalitaCalcolo !== 'oreTotali') {
    testo += `organizzabili in ${result.giorniLavorativiSettimanali} giorni da ${result.oreGiornaliere} ore al giorno`;
  } else {
    testo += `organizzabili in modo flessibile`;
  }

  testo += ` per garantire continuità ed efficienza nel flusso di lavoro.

Ritengo che questa organizzazione permetta una collaborazione stabile e ben integrata con il team, con possibilità di modulare l'impegno in base alle esigenze future del progetto.

Di seguito trovate il link al mio portfolio:
👉 www.simonemassarella.com

In allegato il mio CV aggiornato.

Resto a disposizione per qualsiasi ulteriore confronto o approfondimento operativo.

Grazie per l'attenzione.
Buona giornata,
Simone Massarella

---
Riepilogo economico:
• Tariffa oraria: ${formatCurrency(tariffaOraria)}/h
• Impegno settimanale: ${result.giorniLavorativiSettimanali} giorni (${result.giorniLavorativiSettimanali} × ${result.oreGiornaliere} ore)
• Fatturato mensile: ${formatCurrency(fatturato)}
• Netto mensile: ${formatCurrency(result.nettoMensileReale)}
• Netto spendibile: ${formatCurrency(result.nettoDopoAccantonamentoEffettivo)}
`;

  return testo.trim();
}
