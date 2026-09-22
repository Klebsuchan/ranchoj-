/**
 * Utilitário para cálculo e normalização de preço por unidade de medida padrão (R$/kg, R$/L, R$/unidade)
 */

export interface NormalizedUnitInfo {
  standardUnit: string; // "kg", "L", "un", "rolo", "dose", "g"
  packageAmount: number; // quantidade na unidade padrão (ex: 5 para 5kg, 0.5 para 500g, 0.9 para 900ml)
  displayMeasure: string; // "5 kg", "900 ml", "30 ovos", "12 rolos"
}

/**
 * Detecta a quantidade e a unidade física no nome ou na unidade do produto
 */
export function extractProductPackageInfo(productName: string, unitStr?: string): NormalizedUnitInfo {
  const text = `${productName} ${unitStr || ''}`.toLowerCase();

  // 1. Quilos (kg)
  // Ex: "5kg", "5 kg", "1kg", "1,5kg", "2.5 kg"
  const kgMatch = text.match(/(\d+[.,]?\d*)\s*(?:kg|quilos?)\b/i);
  if (kgMatch) {
    const val = parseFloat(kgMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      return {
        standardUnit: 'kg',
        packageAmount: val,
        displayMeasure: `${val} kg`,
      };
    }
  }

  // 2. Gramas (g) -> converte para kg
  // Ex: "500g", "400 g", "250g", "800g"
  const gMatch = text.match(/(\d+[.,]?\d*)\s*(?:g|gramas?)\b/i);
  if (gMatch) {
    const val = parseFloat(gMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      // Se for menos de 50g e não especificado, pode ser um tempero ou sache
      return {
        standardUnit: 'kg',
        packageAmount: val / 1000,
        displayMeasure: `${val} g`,
      };
    }
  }

  // 3. Litros (L)
  // Ex: "1l", "1 l", "2 litros", "5l"
  const lMatch = text.match(/(\d+[.,]?\d*)\s*(?:l|litros?)\b/i);
  if (lMatch) {
    const val = parseFloat(lMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      return {
        standardUnit: 'L',
        packageAmount: val,
        displayMeasure: `${val} L`,
      };
    }
  }

  // 4. Mililitros (ml) -> converte para L
  // Ex: "900ml", "500 ml", "200ml", "350 ml"
  const mlMatch = text.match(/(\d+[.,]?\d*)\s*(?:ml|mililitros?)\b/i);
  if (mlMatch) {
    const val = parseFloat(mlMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      return {
        standardUnit: 'L',
        packageAmount: val / 1000,
        displayMeasure: `${val} ml`,
      };
    }
  }

  // 5. Ovos / Bandeja
  // Ex: "30 ovos", "12 ovos", "20 ovos", "bandeja 30 un"
  const ovosMatch = text.match(/(\d+)\s*(?:ovos?|unidades?\s+de\s+ovos?)/i);
  if (ovosMatch) {
    const val = parseInt(ovosMatch[1], 10);
    if (!isNaN(val) && val > 0) {
      return {
        standardUnit: 'un',
        packageAmount: val,
        displayMeasure: `${val} ovos`,
      };
    }
  }

  // 6. Rolos (Papel higiênico, papel toalha)
  // Ex: "12 rolos", "4 rolos", "16 rolos"
  const rolosMatch = text.match(/(\d+)\s*(?:rolos?)\b/i);
  if (rolosMatch) {
    const val = parseInt(rolosMatch[1], 10);
    if (!isNaN(val) && val > 0) {
      return {
        standardUnit: 'rolo',
        packageAmount: val,
        displayMeasure: `${val} rolos`,
      };
    }
  }

  // 7. Unidades genéricas
  // Ex: "12 un", "6 un", "pack 4"
  const unMatch = text.match(/(?:pack\s+com\s+|c\/\s*|cx\s+c\/\s*)?(\d+)\s*(?:un|unidades?|sachês?|tabletes?)\b/i);
  if (unMatch) {
    const val = parseInt(unMatch[1], 10);
    if (!isNaN(val) && val > 0) {
      return {
        standardUnit: 'un',
        packageAmount: val,
        displayMeasure: `${val} un`,
      };
    }
  }

  // Padrões pelo campo unitStr se fornecido explicitamente
  if (unitStr) {
    const u = unitStr.toLowerCase();
    if (u === 'kg' || u === 'quilo') {
      return { standardUnit: 'kg', packageAmount: 1, displayMeasure: '1 kg' };
    }
    if (u === 'l' || u === 'litro') {
      return { standardUnit: 'L', packageAmount: 1, displayMeasure: '1 L' };
    }
    if (u === '500g') {
      return { standardUnit: 'kg', packageAmount: 0.5, displayMeasure: '500 g' };
    }
    if (u === '900ml') {
      return { standardUnit: 'L', packageAmount: 0.9, displayMeasure: '900 ml' };
    }
    if (u === 'un' || u === 'unidade' || u === 'pct' || u === 'pacote') {
      return { standardUnit: 'un', packageAmount: 1, displayMeasure: '1 un' };
    }
  }

  // Fallback padrão: 1 unidade
  return {
    standardUnit: 'un',
    packageAmount: 1,
    displayMeasure: '1 un',
  };
}

/**
 * Calcula o preço por unidade padrão
 * @param price Preço do produto em Reais
 * @param packageInfo Informações da embalagem extraídas
 */
export function calculateUnitPrice(price: number, packageInfo: NormalizedUnitInfo): {
  unitPrice: number;
  formatted: string;
  shortLabel: string;
} {
  if (!price || price <= 0 || !packageInfo.packageAmount || packageInfo.packageAmount <= 0) {
    return { unitPrice: 0, formatted: '-', shortLabel: '' };
  }

  const unitPrice = price / packageInfo.packageAmount;
  const formatted = `R$ ${unitPrice.toFixed(2)} / ${packageInfo.standardUnit}`;
  const shortLabel = `${unitPrice.toFixed(2)}/${packageInfo.standardUnit}`;

  return {
    unitPrice,
    formatted,
    shortLabel,
  };
}

/**
 * Compara duas embalagens de tamanhos distintos e calcula a economia real por unidade padrão
 */
export interface PackageComparisonResult {
  pricePerUnitA: number;
  pricePerUnitB: number;
  standardUnit: string;
  cheaperOption: 'A' | 'B' | 'EQUAL';
  savingsPercent: number;
  savingsPerUnit: number;
  recommendation: string;
}

export function compareTwoPackages(
  amountA: number,
  unitA: 'kg' | 'g' | 'L' | 'ml' | 'un',
  priceA: number,
  amountB: number,
  unitB: 'kg' | 'g' | 'L' | 'ml' | 'un',
  priceB: number
): PackageComparisonResult {
  // Converte A para unidade padrão
  let stdAmountA = amountA;
  let standardUnit = 'un';

  if (unitA === 'g') {
    stdAmountA = amountA / 1000;
    standardUnit = 'kg';
  } else if (unitA === 'kg') {
    stdAmountA = amountA;
    standardUnit = 'kg';
  } else if (unitA === 'ml') {
    stdAmountA = amountA / 1000;
    standardUnit = 'L';
  } else if (unitA === 'L') {
    stdAmountA = amountA;
    standardUnit = 'L';
  } else {
    stdAmountA = amountA;
    standardUnit = 'un';
  }

  // Converte B para unidade padrão
  let stdAmountB = amountB;
  if (unitB === 'g') {
    stdAmountB = amountB / 1000;
  } else if (unitB === 'kg') {
    stdAmountB = amountB;
  } else if (unitB === 'ml') {
    stdAmountB = amountB / 1000;
  } else if (unitB === 'L') {
    stdAmountB = amountB;
  } else {
    stdAmountB = amountB;
  }

  const pricePerUnitA = stdAmountA > 0 ? priceA / stdAmountA : 0;
  const pricePerUnitB = stdAmountB > 0 ? priceB / stdAmountB : 0;

  if (Math.abs(pricePerUnitA - pricePerUnitB) < 0.005) {
    return {
      pricePerUnitA,
      pricePerUnitB,
      standardUnit,
      cheaperOption: 'EQUAL',
      savingsPercent: 0,
      savingsPerUnit: 0,
      recommendation: 'As duas embalagens têm exatamente o mesmo custo por unidade de medida.',
    };
  }

  const isACheaper = pricePerUnitA < pricePerUnitB;
  const diffPerUnit = Math.abs(pricePerUnitA - pricePerUnitB);
  const highestRate = Math.max(pricePerUnitA, pricePerUnitB);
  const savingsPercent = highestRate > 0 ? Math.round((diffPerUnit / highestRate) * 100) : 0;

  return {
    pricePerUnitA,
    pricePerUnitB,
    standardUnit,
    cheaperOption: isACheaper ? 'A' : 'B',
    savingsPercent,
    savingsPerUnit: diffPerUnit,
    recommendation: isACheaper
      ? `A Opção A é ${savingsPercent}% mais econômica! Você economiza R$ ${diffPerUnit.toFixed(2)} por ${standardUnit}.`
      : `A Opção B é ${savingsPercent}% mais econômica! Você economiza R$ ${diffPerUnit.toFixed(2)} por ${standardUnit}.`,
  };
}
