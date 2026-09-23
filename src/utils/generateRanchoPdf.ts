import jsPDF from 'jspdf';
import { ShoppingListItem, SupermarketName } from '../types';

interface PdfRanchoOptions {
  items: ShoppingListItem[];
  budgetLimit?: number;
  householdType?: 'solo' | 'casal' | 'familia';
  neighborhood?: string;
  cityName?: string;
  selectedMarket?: string;
}

export function generateRanchoPdf({
  items,
  budgetLimit = 450,
  householdType = 'solo',
  neighborhood = 'Passo Fundo',
  cityName = 'Passo Fundo',
  selectedMarket,
}: PdfRanchoOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm
  let y = 14;

  const now = new Date();
  const formattedDate = now.toLocaleDateString('pt-BR');
  const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // 1. Header background bar
  doc.setFillColor(234, 29, 44); // iFood Red #EA1D2C
  doc.roundedRect(margin, y, contentWidth, 22, 2.5, 2.5, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('RANCHOJÁ - LISTA OFICIAL DE COMPRAS', margin + 6, y + 8.5);

  // Subtitle / Location / Time
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(254, 226, 226); // red-100
  const locationInfo = cityName ? `${cityName}${neighborhood && neighborhood !== cityName ? ` (${neighborhood})` : ''}` : neighborhood;
  const marketInfo = selectedMarket ? ` • Mercado: ${selectedMarket}` : '';
  const profileInfo = householdType === 'solo' ? 'Individual' : 'Casal / Família';
  doc.text(`Local: ${locationInfo}${marketInfo}  •  Perfil: ${profileInfo}  •  ${formattedDate} às ${formattedTime}`, margin + 6, y + 15.5);

  y += 27;

  // 2. Summary Metrics Card
  const totalCost = items.reduce((acc, i) => acc + (i.totalPrice || (i.unitPrice * i.quantity) || 0), 0);
  const diff = budgetLimit - totalCost;
  const isOver = diff < 0;
  const boughtCount = items.filter((i) => i.isBought).length;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  doc.text(`Total Previsto: R$ ${totalCost.toFixed(2)}`, margin + 6, y + 6.5);
  doc.text(`Teto Orçado: R$ ${budgetLimit.toFixed(2)}`, margin + 65, y + 6.5);

  if (isOver) {
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text(`Excesso: R$ ${Math.abs(diff).toFixed(2)}`, margin + 125, y + 6.5);
  } else {
    doc.setTextColor(16, 185, 129); // positive green balance
    doc.text(`Economia / Saldo: R$ ${diff.toFixed(2)}`, margin + 125, y + 6.5);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Itens: ${items.length} produtos cadastrados  •  ${boughtCount} já marcados como pegos  •  Pronto para compras offline`, margin + 6, y + 12);

  y += 21;

  // 3. Table Headers
  const colCheck = margin + 3;
  const colName = margin + 12;
  const colQty = margin + 86;
  const colMarket = margin + 108;
  const colUnit = margin + 148;
  const colTotal = margin + 168;

  const drawTableHeader = () => {
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, y, contentWidth, 7.5, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y + 7.5, margin + contentWidth, y + 7.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    doc.text('[ ]', colCheck, y + 5);
    doc.text('PRODUTO / ITEM', colName, y + 5);
    doc.text('QTD', colQty, y + 5);
    doc.text('MERCADO / LOCAL', colMarket, y + 5);
    doc.text('UNIT (R$)', colUnit, y + 5);
    doc.text('TOTAL (R$)', colTotal, y + 5);

    y += 7.5;
  };

  drawTableHeader();

  // Group items by supermarket for breakdown
  const marketGrouping: Record<string, { count: number; subtotal: number }> = {};

  doc.setFont('helvetica', 'normal');

  items.forEach((item, index) => {
    // New page check
    if (y > pageHeight - 32) {
      doc.addPage();
      y = 14;
      drawTableHeader();
    }

    // Determine target market
    let marketName = item.selectedMarket as string;
    if (!marketName || marketName === 'best') {
      const validPrices = Object.entries(item.prices || {}).filter(([_, p]) => typeof p === 'number' && p > 0);
      const minEntry = validPrices.sort((a, b) => (a[1] as number) - (b[1] as number))[0];
      marketName = minEntry ? minEntry[0] : (selectedMarket || 'Stock Center');
    }

    if (!marketGrouping[marketName]) {
      marketGrouping[marketName] = { count: 0, subtotal: 0 };
    }
    marketGrouping[marketName].count += item.quantity;
    marketGrouping[marketName].subtotal += item.totalPrice;

    // Row zebra striping
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 7, 'F');
    }

    // Checkbox square for pen checking in the aisles
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.rect(colCheck, y + 1.5, 3.8, 3.8);

    if (item.isBought) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(16, 185, 129);
      doc.text('X', colCheck + 0.9, y + 4.4);
    }

    // Item details
    doc.setFont('helvetica', item.isBought ? 'normal' : 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(item.isBought ? 148 : 15, item.isBought ? 163 : 23, item.isBought ? 184 : 42);

    let displayName = item.name;
    if (item.brand && !displayName.toLowerCase().includes(item.brand.toLowerCase())) {
      displayName += ` (${item.brand})`;
    }
    if (displayName.length > 44) {
      displayName = displayName.substring(0, 42) + '...';
    }
    doc.text(displayName, colName, y + 4.8);

    // Quantity
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`${item.quantity} ${item.unit || 'un'}`, colQty, y + 4.8);

    // Market
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const mNameTruncated = marketName.length > 20 ? marketName.substring(0, 18) + '..' : marketName;
    doc.text(mNameTruncated, colMarket, y + 4.8);

    // Unit Price
    doc.setTextColor(100, 116, 139);
    doc.text(item.unitPrice.toFixed(2), colUnit, y + 4.8);

    // Total Price
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(item.totalPrice.toFixed(2), colTotal, y + 4.8);

    y += 7;
  });

  y += 5;

  // 4. Footer Section: Market Breakdown & Store Note Space
  if (y > pageHeight - 48) {
    doc.addPage();
    y = 14;
  }

  // Summary card
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('RESUMO DE COMPRA POR SUPERMERCADO:', margin + 5, y + 5.5);

  const marketEntries = Object.entries(marketGrouping);
  const displayMarkets = marketEntries.slice(0, 4);
  const colW = (contentWidth - 10) / Math.max(displayMarkets.length, 1);

  displayMarkets.forEach(([mName, stats], idx) => {
    const xPos = margin + 5 + idx * colW;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    const shortMName = mName.length > 18 ? mName.substring(0, 16) + '..' : mName;
    doc.text(shortMName, xPos, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`${stats.count} itens • R$ ${stats.subtotal.toFixed(2)}`, xPos, y + 17.5);
  });

  y += 28;

  // Space for user notes at cash register
  if (y < pageHeight - 14) {
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, margin + contentWidth, y);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Anotações do Caixa: Valor Total Pago R$ ____________   |   Data da Compra: _____/_____/_________',
      margin + 4,
      y + 5
    );
    doc.text(
      '✅ Gerado pelo RanchoJá (https://ranchoja.app) - Lista física pronta para levar às compras sem depender de internet ou bateria.',
      margin + 4,
      y + 10
    );
  }

  // Save the PDF file
  const safeCity = cityName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `RanchoJa-${safeCity}-${now.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
