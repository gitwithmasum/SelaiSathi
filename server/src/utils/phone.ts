/**
 * Validates and normalizes Bangladeshi phone numbers.
 * Allowed formats: "01711000000", "+8801711000000", "8801711000000"
 * Valid prefix: 013, 014, 015, 016, 017, 018, 019
 */
export function normalizeBdPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  if (/^\+8801[3-9]\d{8}$/.test(cleaned)) {
    return cleaned;
  }

  if (/^8801[3-9]\d{8}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  if (/^01[3-9]\d{8}$/.test(cleaned)) {
    return `+88${cleaned}`;
  }

  throw new Error('অকার্যকর মোবাইল নম্বর! সঠিক বাংলাদেশি নম্বর দিন (যেমন: 017XXXXXXXX)');
}

export function isValidBdPhone(phone: string): boolean {
  try {
    normalizeBdPhone(phone);
    return true;
  } catch {
    return false;
  }
}
