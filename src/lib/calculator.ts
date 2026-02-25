export interface CalculationInput {
  fatturatoMensile: number;
  codiceAteco?: string;
  coefficienteRedditivita: number;
  aliquotaImpostaSostitutiva: number;
  aliquotaContributiPrevidenziali: number;
  oreLavorateMensili?: number;
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
}

export function calculateForfettario(input: CalculationInput): CalculationResult {
  const {
    fatturatoMensile,
    coefficienteRedditivita,
    aliquotaImpostaSostitutiva,
    aliquotaContributiPrevidenziali,
    oreLavorateMensili = 138, // Default 138 ore mensili (circa 35 ore/settimana)
  } = input;

  // Calcolo reddito imponibile
  const redditoImponibile = fatturatoMensile * coefficienteRedditivita;

  // Calcolo imposta sostitutiva
  const impostaSostitutiva = redditoImponibile * aliquotaImpostaSostitutiva;

  // Calcolo contributi previdenziali
  const contributiPrevidenziali = redditoImponibile * aliquotaContributiPrevidenziali;

  // Totale tasse e contributi
  const totaleTasseContributi = impostaSostitutiva + contributiPrevidenziali;

  // Netto mensile reale
  const nettoMensileReale = fatturatoMensile - totaleTasseContributi;

  // Percentuale da accantonare (40% del fatturato)
  const percentualeDaAccantonare = 0.4;
  const accantonamentoTotale = fatturatoMensile * percentualeDaAccantonare;

  // Netto disponibile dopo accantonamento
  // Nota: il netto disponibile è il netto reale, l'accantonamento è solo una riserva
  const nettoDisponibile = nettoMensileReale;
  
  // Netto dopo accantonamento effettivo (se si decidesse di mettere da parte il 40% ogni mese)
  // Nota: l'accantonamento si calcola sul FATTURATO, non sul netto
  const nettoDopoAccantonamentoEffettivo = fatturatoMensile - accantonamentoTotale;

  // Percentuale tasse/contributi rispetto al fatturato
  const percentualeTasseContributi = (totaleTasseContributi / fatturatoMensile) * 100;

  // Divisione accantonamento tra saldo e acconti
  const accantonamentoSaldo = accantonamentoTotale * 0.6; // 60% per saldo (giugno)
  const accantonamentoAcconti = accantonamentoTotale * 0.4; // 40% per acconti (novembre)

  // Calcolo tariffe orarie
  const tariffaOrariaNetta = oreLavorateMensili > 0 ? nettoMensileReale / oreLavorateMensili : 0;
  const tariffaOrariaSpendibile = oreLavorateMensili > 0 ? nettoDopoAccantonamentoEffettivo / oreLavorateMensili : 0;

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
