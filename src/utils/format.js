// Extended suffixes: K M B T Qa Qi Sx Sp Oc No Dc aa ab ac ad ae af ...
const SUFFIXES = [
  '', 'K', 'M', 'B', 'T',
  'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
];
// Generate aa-zz for beyond Dc (1e36+)
for (let i = 0; i < 26; i++) {
  for (let j = 0; j < 26; j++) {
    SUFFIXES.push(String.fromCharCode(97 + i) + String.fromCharCode(97 + j));
  }
}

export const fmt = (n) => {
  if (n < 0) return '-' + fmt(-n);
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1e6) return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Find the right suffix tier (each tier = 1e3)
  const tier = Math.floor(Math.log10(n) / 3);
  if (tier < SUFFIXES.length) {
    const scaled = n / Math.pow(10, tier * 3);
    return scaled.toFixed(2) + SUFFIXES[tier];
  }
  // Fallback for extremely large numbers
  return n.toExponential(2);
};

export const pk = (a) => a[Math.floor(Math.random() * a.length)];

export const buildingCost = (b, count) => Math.floor(b.baseCost * Math.pow(1.15, count));

export const buildingCostN = (b, count, n) => {
  let total = 0;
  for (let i = 0; i < n; i++) total += Math.floor(b.baseCost * Math.pow(1.15, count + i));
  return total;
};
