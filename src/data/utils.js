export const fmt = (value) =>
  '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const num = (value) => parseFloat(value) || 0;

export const lineTotal = (rate, qty) => num(rate) * num(qty);