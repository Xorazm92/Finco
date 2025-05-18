// Util: /kpi komandasi uchun matndan qiymat va izohni ajratib olish
export function parseKpiMessage(text: string): { value: number | null, comment: string } {
  const match = text.match(/^\/kpi\s+([\d,.]+)\s*(.*)$/i);
  if (!match) return { value: null, comment: '' };
  const value = parseFloat(match[1].replace(',', '.'));
  const comment = match[2]?.trim() || '';
  return { value: isNaN(value) ? null : value, comment };
}
