export const fmt = (n) => {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + '兆';
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '億';
  if (n >= 1e4) return (n / 1e4).toFixed(1) + '萬';
  if (n >= 1e3) return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return Math.floor(n).toString();
};

export const pk = (a) => a[Math.floor(Math.random() * a.length)];

export const buildingCost = (b, count) => Math.floor(b.baseCost * Math.pow(1.15, count));

export const buildingCostN = (b, count, n) => {
  let total = 0;
  for (let i = 0; i < n; i++) total += Math.floor(b.baseCost * Math.pow(1.15, count + i));
  return total;
};
