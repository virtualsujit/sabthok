/**
 * Format a price value as Nepali Rupees.
 * @param price - The price as a number or string
 * @returns Formatted price string like "Rs. 1,50,000"
 */
export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? Number(price) : price;
  if (isNaN(num)) return "Rs. 0";

  // Nepali numbering: last 3 digits, then groups of 2
  const str = Math.floor(num).toString();
  if (str.length <= 3) return `Rs. ${str}`;

  const last3 = str.slice(-3);
  const remaining = str.slice(0, -3);
  const grouped = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  return `Rs. ${grouped},${last3}`;
}

/**
 * Format relative time for listing dates.
 */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return new Date(dateStr).toLocaleDateString("en-NP");
}
