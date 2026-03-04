export interface ProfiloProfessionale {
  nomeAttivita: string;
  nomeCognome: string;
  codiceFiscale: string;
  partitaIva: string;
  codiceAteco: string;
  regime: string;
  impostaSostitutiva: number;
  coefficienteRedditivita: number;
  dataInizioAttivita: string;
  cassaPrevidenziale: string;
  matricola: string;
  dataIscrizione: string;
}

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
  importoAccantonamento: number;
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
  const fatturatoDaTariffaOraria = modalitaCalcolo === 'tariffaOraria' ? fatturatoFinale : undefined;

  return {
    redditoImponibile,
    impostaSostitutiva,
    contributiPrevidenziali,
    totaleTasseContributi,
    nettoMensileReale,
    percentualeDaAccantonare,
    nettoDisponibile,
    nettoDopoAccantonamentoEffettivo,
    importoAccantonamento: accantonamentoTotale,
    percentualeTasseContributi,
    accantonamentoSaldo,
    accantonamentoAcconti,
    oreLavorateTotali: oreTotali,
    giorniLavorativi: giorni,
    oreGiornaliere: oreGiornaliere,
    giorniLavorativiSettimanali: giorniSettimanali,
    tariffaOrariaNetta,
    tariffaOrariaSpendibile,
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

export function calcolaGiorniLavorativiMensiliReali(giorniSettimanali: number, anno: number = new Date().getFullYear(), mese: number = new Date().getMonth()): number {
  // Calcola i giorni lavorativi reali per un mese specifico
  // Esclude sabato e domenica
  
  const primoGiorno = new Date(anno, mese, 1);
  const ultimoGiorno = new Date(anno, mese + 1, 0); // Ultimo giorno del mese
  
  let giorniLavorativi = 0;
  const giorniSettimanaLavorativi = Math.min(giorniSettimanali, 5); // Max 5 giorni lavorativi a settimana
  
  // Mappatura giorni lavorativi per ogni giorno della settimana
  // 0=Domenica, 1=Lunedì, ..., 6=Sabato
  const giorniLavorativiSettimana = [
    false, // Domenica
    true,  // Lunedì
    true,  // Martedì
    true,  // Mercoledì
    true,  // Giovedì
    true,  // Venerdì
    false  // Sabato
  ];
  
  // Se lavori meno di 5 giorni, disabilita gli ultimi giorni
  if (giorniSettimanaLavorativi < 5) {
    for (let i = 5; i >= giorniSettimanaLavorativi; i--) {
      giorniLavorativiSettimana[i + 1] = false; // Venerdì=5, Giovedì=4, ecc.
    }
  }
  
  // Conta i giorni lavorativi nel mese
  for (let giorno = 1; giorno <= ultimoGiorno.getDate(); giorno++) {
    const dataCorrente = new Date(anno, mese, giorno);
    const giornoSettimana = dataCorrente.getDay();
    
    if (giorniLavorativiSettimana[giornoSettimana]) {
      giorniLavorativi++;
    }
  }
  
  return giorniLavorativi;
}

export function getDettaglioGiorniLavorativiMese(giorniSettimanali: number, anno: number = new Date().getFullYear(), mese: number = new Date().getMonth()): {
  giorniTotali: number;
  giorniLavorativi: number;
  festivi: number;
  weekend: number;
  nomeMese: string;
} {
  const primoGiorno = new Date(anno, mese, 1);
  const ultimoGiorno = new Date(anno, mese + 1, 0);
  
  const nomiMesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                   'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  
  let giorniLavorativi = 0;
  let giorniWeekend = 0;
  const giorniSettimanaLavorativi = Math.min(giorniSettimanali, 5);
  
  // Mappatura giorni lavorativi
  const giorniLavorativiSettimana = [
    false, // Domenica
    true,  // Lunedì
    true,  // Martedì
    true,  // Mercoledì
    true,  // Giovedì
    true,  // Venerdì
    false  // Sabato
  ];
  
  // Se lavori meno di 5 giorni, disabilita gli ultimi giorni
  if (giorniSettimanaLavorativi < 5) {
    for (let i = 5; i >= giorniSettimanaLavorativi; i--) {
      giorniLavorativiSettimana[i + 1] = false;
    }
  }
  
  // Conta i giorni nel mese
  for (let giorno = 1; giorno <= ultimoGiorno.getDate(); giorno++) {
    const dataCorrente = new Date(anno, mese, giorno);
    const giornoSettimana = dataCorrente.getDay();
    
    if (giornoSettimana === 0 || giornoSettimana === 6) {
      giorniWeekend++;
    } else if (giorniLavorativiSettimana[giornoSettimana]) {
      giorniLavorativi++;
    }
  }
  
  return {
    giorniTotali: ultimoGiorno.getDate(),
    giorniLavorativi,
    festivi: giorniWeekend,
    weekend: giorniWeekend,
    nomeMese: nomiMesi[mese]
  };
}

export const PROFILO_PREDEFINITO: ProfiloProfessionale = {
  nomeAttivita: 'Massarella Simone',
  nomeCognome: 'Massarella Simone',
  codiceFiscale: 'MSSSMN88A28D662T',
  partitaIva: '03339090593',
  codiceAteco: '74.12.01',
  regime: 'Forfettario',
  impostaSostitutiva: 5,
  coefficienteRedditivita: 78,
  dataInizioAttivita: '02/09/2025',
  cassaPrevidenziale: 'GS INPS',
  matricola: '4000',
  dataIscrizione: '08/09/2025'
};

export function generaTestoRiepilogo(input: CalculationInput, result: CalculationResult): string {
  const data = new Date().toLocaleDateString('it-IT');
  const profilo = PROFILO_PREDEFINITO;
  
  let testo = `
CALCOLO REDDITO FORFETTARIO
Data: ${data}
==========================================

PROFILO PROFESSIONALE:
• Nome Attività: ${profilo.nomeAttivita}
• Partita IVA: ${profilo.partitaIva}
• Codice Fiscale: ${profilo.codiceFiscale}
• Codice ATECO: ${profilo.codiceAteco}
• Regime: ${profilo.regime}
• Cassa Previdenziale: ${profilo.cassaPrevidenziale} (Matr. ${profilo.matricola})
• Inizio Attività: ${profilo.dataInizioAttivita}

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
• Fatturato Lordo Mensile: ${formatCurrency(result.fatturatoDaTariffaOraria || input.fatturatoMensile)}
• Importo da Accantonare (40%): ${formatCurrency(result.importoAccantonamento)}
• Netto Spendibile Residuo: ${formatCurrency(result.nettoDopoAccantonamentoEffettivo)}
• Netto Mensile Reale (prima accantonamento): ${formatCurrency(result.nettoMensileReale)}

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
${profilo.nomeAttivita} - P.IVA ${profilo.partitaIva}
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
  if (input.serviziInclusi?.htmlcss) {
    // Rimuovi "sviluppo front-end" se c'è già HTML/CSS per evitare duplicazioni
    const frontendIndex = servizi.indexOf('sviluppo front-end');
    if (frontendIndex > -1) {
      servizi[frontendIndex] = 'sviluppo front-end (HTML/CSS)';
    } else {
      servizi.push('HTML/CSS');
    }
  }
  
  const descrizioneServizi = servizi.length > 0 ? servizi.join(' e ') : 'sviluppo web';
  
  let testo = `Oggetto: Proposta collaborazione – UX/UI & Front-end

Buonasera,

come anticipato durante il colloquio, confermo il mio interesse a collaborare al vostro progetto.
In riferimento al ruolo che integra attività di ${descrizioneServizi}, propongo una tariffa di ${formatCurrency(tariffaOraria)}/h, con un impegno di ${result.giorniLavorativiSettimanali * result.oreGiornaliere} ore settimanali,`;

  // Aggiungi dettaglio organizzazione ore
  if (input.modalitaCalcolo !== 'oreTotali') {
    testo += `organizzabili in modo strutturato per garantire continuità ed efficienza nel flusso di lavoro.`;
  } else {
    testo += `organizzabili in modo flessibile per garantire continuità ed efficienza nel flusso di lavoro.`;
  }

  testo += `

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
• Fatturato lordo mensile: ${formatCurrency(fatturato)}
• Tasse e contributi totali: ${formatCurrency(result.totaleTasseContributi)}
• Netto mensile reale: ${formatCurrency(result.nettoMensileReale)}
• Accantonamento (40% del fatturato): ${formatCurrency(result.importoAccantonamento)}
• Netto spendibile residuo: ${formatCurrency(result.nettoDopoAccantonamentoEffettivo)}
`;

  return testo.trim();
}
