export const fmt = (n) => {
  if (n >= 1e15) return (n / 1e15).toFixed(2) + 'Q';
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3)  return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return Math.floor(n).toString();
};

export const pk = (a) => a[Math.floor(Math.random() * a.length)];

export const buildingCost = (b, count) => Math.floor(b.baseCost * Math.pow(1.15, count));

export const buildingCostN = (b, count, n) => {
  let total = 0;
  for (let i = 0; i < n; i++) total += Math.floor(b.baseCost * Math.pow(1.15, count + i));
  return total;
};
