import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CalculationInput, CalculationResult, formatCurrency, formatPercentage } from './calculator';

export async function exportToPDF(
  input: CalculationInput,
  results: CalculationResult,
  elementId?: string
): Promise<void> {
  const pdf = new jsPDF();
  
  // Aggiungi titolo
  pdf.setFontSize(20);
  pdf.text('Calcolo Regime Forfettario', 20, 20);
  
  // Aggiungi data
  pdf.setFontSize(10);
  pdf.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 20, 30);
  
  // Dati di input
  pdf.setFontSize(14);
  pdf.text('Dati di Input:', 20, 45);
  
  pdf.setFontSize(11);
  let yPosition = 55;
  pdf.text(`Fatturato Mensile: ${formatCurrency(input.fatturatoMensile)}`, 20, yPosition);
  yPosition += 8;
  
  if (input.codiceAteco) {
    pdf.text(`Codice ATECO: ${input.codiceAteco}`, 20, yPosition);
    yPosition += 8;
  }
  
  pdf.text(`Coefficiente Redditività: ${formatPercentage(input.coefficienteRedditivita * 100)}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Aliquota Imposta Sostitutiva: ${formatPercentage(input.aliquotaImpostaSostitutiva * 100)}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Aliquota Contributi Previdenziali: ${formatPercentage(input.aliquotaContributiPrevidenziali * 100)}`, 20, yPosition);
  
  // Risultati
  yPosition += 15;
  pdf.setFontSize(14);
  pdf.text('Risultati del Calcolo:', 20, yPosition);
  
  pdf.setFontSize(11);
  yPosition += 10;
  pdf.text(`Reddito Imponibile: ${formatCurrency(results.redditoImponibile)}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Imposta Sostitutiva: ${formatCurrency(results.impostaSostitutiva)}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Contributi Previdenziali: ${formatCurrency(results.contributiPrevidenziali)}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Totale Tasse e Contributi: ${formatCurrency(results.totaleTasseContributi)}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Netto Mensile Reale: ${formatCurrency(results.nettoMensileReale)}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Netto Disponibile (dopo accantonamento): ${formatCurrency(results.nettoDisponibile)}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Percentuale Tasse/Contributi: ${formatPercentage(results.percentualeTasseContributi)}`, 20, yPosition);
  
  // Accantonamenti
  yPosition += 15;
  pdf.setFontSize(14);
  pdf.text('Accantonamenti Fiscali:', 20, yPosition);
  
  pdf.setFontSize(11);
  yPosition += 10;
  pdf.text(`Accantonamento Totale: ${formatCurrency(results.redditoImponibile * 0.4)} (${formatPercentage(results.percentualeDaAccantonare)})`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Saldo (Giugno): ${formatCurrency(results.accantonamentoSaldo)}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Acconti (Novembre): ${formatCurrency(results.accantonamentoAcconti)}`, 20, yPosition);
  
  // Se è specificato un elemento, aggiungi screenshot
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
        });
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addPage();
        pdf.text('Riepilogo Visivo:', 20, 20);
        pdf.addImage(imgData, 'PNG', 20, 30, 170, 100);
      } catch (error) {
        console.error('Errore durante la generazione dello screenshot:', error);
      }
    }
  }
  
  // Salva il PDF
  pdf.save(`calcolo-forfettario-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function downloadJSON(input: CalculationInput, results: CalculationResult): void {
  const data = {
    data: new Date().toISOString(),
    input,
    results,
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calcolo-forfettario-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
