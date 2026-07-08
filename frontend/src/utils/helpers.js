// Formats a number as USD currency (e.g. 1234.5 → "$1,234.50")
export function formatCurrency(value) {

  return new Intl.NumberFormat('en-US', {

    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

// Formats a number as percentage with sign (e.g. 3.24 → "+3.24%")
export function formatPercent(value) {

  const n = value ?? 0;
  const sign = n >= 0 ? '+' : '';

  return `${sign}${n.toFixed(2)}%`;
}

// Returns relative time string (e.g. "3 hours ago")
export function timeAgo(date) {

  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

  const intervals = [
    { label: 'year', secs: 31536000 },
    { label: 'month', secs: 2592000 },
    { label: 'week', secs: 604800 },
    { label: 'day', secs: 86400 },
    { label: 'hour', secs: 3600 },
    { label: 'minute', secs: 60 },
  ];

  for (const { label, secs } of intervals) {

    const count = Math.floor(seconds / secs);

    if (count >= 1) return `${count} ${label}${count !== 1 ? 's' : ''} ago`;
  }


  return 'just now';
}
