/**
 * Converts English digits to Bengali digits.
 * e.g., 1250 -> ১২৫০
 */
export function toBengaliNumber(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

/**
 * Format currency in Bangladeshi Taka.
 * e.g., 850 -> ৳ ৮৫০
 */
export function formatTaka(amount: number | string): string {
  return `৳ ${toBengaliNumber(amount)}`;
}

/**
 * Formats stage into Bengali label.
 */
export function getStageBengaliLabel(stage: string): string {
  const map: Record<string, string> = {
    FABRIC_RECEIVED: 'কাপড় গ্রহণ',
    CUTTING: 'কাটিং সম্পন্ন',
    STITCHING: 'সেলাই চলছে',
    FINISHING_IRONING: 'ফিনিশিং ও ইস্ত্রি',
    TRIAL: 'ট্রায়ালের জন্য রেডি',
    READY: 'ডেলিভারির জন্য প্রস্তুত',
    DELIVERED: 'ডেলিভারি সম্পন্ন',
    CANCELLED: 'বাতিল'
  };
  return map[stage] || stage;
}

/**
 * Generate formatted WhatsApp message for order update.
 */
export function generateWhatsAppMessage(options: {
  customerName: string;
  shopName: string;
  orderNo: string;
  totalPrice: number | string;
  advancePaid: number | string;
  dueAmount: number | string;
  trackingUrl: string;
}): string {
  return encodeURIComponent(
    `আসসালামু আলাইকুম ${options.customerName},\n` +
    `আপনার অর্ডারটি "${options.shopName}"-এ গ্রহণ করা হয়েছে।\n\n` +
    `অর্ডার নং: ${options.orderNo}\n` +
    `মোট বিল: ${formatTaka(options.totalPrice)}\n` +
    `জমা: ${formatTaka(options.advancePaid)}\n` +
    `বকেয়া: ${formatTaka(options.dueAmount)}\n\n` +
    `কাজের বর্তমান অবস্থা দেখতে লিংকে ক্লিক করুন:\n` +
    `${options.trackingUrl}\n\n` +
    `ধন্যবাদ,\n${options.shopName} (সেলাই সাথী)`
  );
}
