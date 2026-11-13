/**
 * TalentFlow 360 - Indian Rupee & LPA Currency Formatter Utility
 */

/**
 * Formats an annual salary range or single value into standard Indian Lakhs Per Annum (LPA) style.
 * Examples:
 * - formatLPA(1400000, 2200000) -> "₹14 - ₹22 LPA"
 * - formatLPA(450000, 750000)   -> "₹4.5 - ₹7.5 LPA"
 * - formatLPA(1400000)           -> "₹14 LPA+"
 * - formatLPA(14.5, 22.0)        -> "₹14.5 - ₹22 LPA"
 */
export function formatLPA(min?: number | null, max?: number | null): string {
  if (!min && !max) return '₹ Competitive LPA';

  const toLakhs = (val: number): string => {
    // If the number is already in single/double digits (e.g. 14 or 4.5), return as is
    if (val < 500) {
      return val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
    }
    // If stored as full numeric rupees (e.g. 14,00,000), divide by 100,000
    const lakhs = val / 100000;
    return lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1);
  };

  if (min && max) {
    return `₹${toLakhs(min)} - ₹${toLakhs(max)} LPA`;
  }
  if (min) {
    return `₹${toLakhs(min)} LPA+`;
  }
  return `Up to ₹${toLakhs(max!)} LPA`;
}

/**
 * Formats salary for detailed view in both LPA and Indian Rupee / annum format.
 * Example:
 * formatDetailedLPA(1400000, 2200000) -> "₹14.0 - ₹22.0 Lakhs / annum (₹14 - ₹22 LPA)"
 */
export function formatDetailedLPA(min?: number | null, max?: number | null): string {
  if (!min && !max) return 'Competitive (As per industry standards)';

  const toLakhs = (val: number): string => {
    if (val < 500) return val.toFixed(1);
    const lakhs = val / 100000;
    return lakhs.toFixed(1);
  };

  if (min && max) {
    return `₹${toLakhs(min)} - ₹${toLakhs(max)} Lakhs / annum (${formatLPA(min, max)})`;
  }
  if (min) {
    return `From ₹${toLakhs(min)} Lakhs / annum (${formatLPA(min)})`;
  }
  return `Up to ₹${toLakhs(max!)} Lakhs / annum (${formatLPA(undefined, max)})`;
}

/**
 * Formats a single compensation number in Indian Lakhs style.
 * Example:
 * formatSingleSalary(1400000) -> "₹14 Lakhs / annum (₹14 LPA)"
 */
export function formatSingleSalary(amount?: number | null): string {
  if (!amount || amount === 0) return 'Undisclosed';
  
  if (amount < 500) {
    return `₹${amount} LPA (₹${amount} Lakhs / annum)`;
  }

  const lakhs = (amount / 100000).toFixed(1).replace(/\.0$/, '');
  return `₹${lakhs} Lakhs / annum (₹${lakhs} LPA)`;
}

