import jsPDF from 'jspdf';
import { ShoppingListItem, SupermarketName } from '../types';

interface PdfRanchoOptions {
  items: ShoppingListItem[];
  budgetLimit?: number;
  householdType?: 'solo' | 'casal';
  neighborhood?: string;
}

export function generateRanchoPdf({
  items,
  budgetLimit = 450,
  householdType = 'solo',
  neighborhood = 'Passo Fundo - RS',
}: PdfRanchoOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 16;

  // Header background bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 3, 3, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('RANCHOJÁ - LISTA DE COMPRAS E ECONOMIA', margin + 6, y + 9);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  const now = new Date();
  const formattedDate = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  doc.text(`${neighborhood || 'Sua Região'}  •  Gerado em ${formattedDate}  •  Perfil: ${householdType === 'solo' ? 'Morando Sozinho' : 'Em Casal'}`, margin + 6, y + 16);

  y += 30;

  // Summary Metrics Bar
  const totalCost = items.reduce((acc, i) => acc + i.totalPrice, 0);
  const diff = budgetLimit - totalCost;
  const isOver = diff < 0;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  doc.text(`Total do Rancho: R$ ${totalCost.toFixed(2)}`, margin + 6, y + 7);
  doc.text(`Teto Orçado: R$ ${budgetLimit.toFixed(2)}`, margin + 60, y + 7);

  if (isOver) {
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text(`Estourou: R$ ${Math.abs(diff).toFixed(2)}`, margin + 115, y + 7);
  } else {
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text(`Saldo Livre: R$ ${diff.toFixed(2)}`, margin + 115, y + 7);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total de Itens: ${items.length} produtos selecionados nos encartes locais`, margin + 6, y + 12);

  y += 22;

  // Table Column Headers
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  doc.text('[ ]', margin + 3, y + 5.5);
  doc.text('PRODUTO / ITEM', margin + 14, y + 5.5);
  doc.text('QTD', margin + 92, y + 5.5);
  doc.text('MERCADO RECOMENDADO', margin + 107, y + 5.5);
  doc.text('UNIT (R$)', margin + 152, y + 5.5);
  doc.text('TOTAL (R$)', margin + 172, y + 5.5);

  y += 8;

  // Group items by selected or best market
  const marketGrouping: Record<string, { count: number; subtotal: number }> = {
    'Stock Center': { count: 0, subtotal: 0 },
    'Atacadão': { count: 0, subtotal: 0 },
    'Zaffari': { count: 0, subtotal: 0 },
    'Bourbon': { count: 0, subtotal: 0 },
  };

  doc.setFont('helvetica', 'normal');

  items.forEach((item, index) => {
    // Check page height
    if (y > pageHeight - 35) {
      doc.addPage();
      y = 16;

      // Repeat Table Header on new page
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text('[ ]', margin + 3, y + 5.5);
      doc.text('PRODUTO / ITEM', margin + 14, y + 5.5);
      doc.text('QTD', margin + 92, y + 5.5);
      doc.text('MERCADO RECOMENDADO', margin + 107, y + 5.5);
      doc.text('UNIT (R$)', margin + 152, y + 5.5);
      doc.text('TOTAL (R$)', margin + 172, y + 5.5);
      y += 8;
      doc.setFont('helvetica', 'normal');
    }

    // Determine cheapest / chosen market
    let marketName = item.selectedMarket as string;
    if (item.selectedMarket === 'best') {
      const validPrices = Object.entries(item.prices || {}).filter(([_, p]) => typeof p === 'number' && p > 0);
      const minEntry = validPrices.sort((a, b) => (a[1] as number) - (b[1] as number))[0];
      marketName = minEntry ? minEntry[0] : 'Stock Center';
    }

    if (marketGrouping[marketName]) {
      marketGrouping[marketName].count += item.quantity;
      marketGrouping[marketName].subtotal += item.totalPrice;
    }

    // Alternate row background
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 7.5, 'F');
    }

    // Checkbox box
    doc.setDrawColor(148, 163, 184);
    doc.rect(margin + 3, y + 1.8, 3.8, 3.8);

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    // Truncate long name if necessary
    const itemName = item.name.length > 44 ? item.name.substring(0, 42) + '...' : item.name;
    doc.text(itemName, margin + 14, y + 5);

    // Quantity
    doc.text(`${item.quantity} ${item.unit}`, margin + 92, y + 5);

    // Recommended Supermarket
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(marketName, margin + 107, y + 5);

    // Unit & Total Price
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${item.unitPrice.toFixed(2)}`, margin + 152, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.totalPrice.toFixed(2)}`, margin + 172, y + 5);

    y += 7.5;
  });

  y += 6;

  // Check if summary fits, otherwise new page
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 16;
  }

  // Supermarket breakdown box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('GUIA DE COMPRA POR MERCADO EM PASSO FUNDO:', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  let colX = margin + 5;
  const colWidth = (pageWidth - margin * 2 - 10) / 4;

  const markets: SupermarketName[] = ['Stock Center', 'Atacadão', 'Zaffari', 'Bourbon'];
  markets.forEach((m) => {
    const stats = marketGrouping[m] || { count: 0, subtotal: 0 };
    doc.setFont('helvetica', 'bold');
    doc.text(m, colX, y + 13);
    doc.setFont('helvetica', 'normal');
    doc.text(`${stats.count} itens  •  R$ ${stats.subtotal.toFixed(2)}`, colX, y + 19);
    colX += colWidth;
  });

  // Footer notes and checkline
  y += 32;
  if (y < pageHeight - 15) {
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Dica: Marque com caneta os itens na medida que colocar no carrinho. Preços sujeitos a variação conforme o dia do encarte em Passo Fundo.',
      margin,
      y + 5
    );
  }

  // Save the PDF file
  const fileName = `RanchoJa-${now.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
