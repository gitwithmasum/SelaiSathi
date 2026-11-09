export interface ReceiptData {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  orderNo: string;
  fabricTagCode: string;
  customerName: string;
  customerPhone: string;
  deliveryDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  advancePaid: number;
  dueAmount: number;
  trackingUrl: string;
}

/**
 * Formats order data into standard 32-column monospaced text for 58mm POS thermal printers.
 */
export function generate58mmReceiptText(data: ReceiptData): string {
  const line = '--------------------------------';
  const doubleLine = '================================';

  const center = (text: string, width = 32) => {
    const pad = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(pad) + text;
  };

  const row = (left: string, right: string, width = 32) => {
    const space = Math.max(1, width - left.length - right.length);
    return left + ' '.repeat(space) + right;
  };

  return [
    center(data.shopName),
    center(data.shopAddress),
    center(`ফোন: ${data.shopPhone}`),
    doubleLine,
    center('*** ক্যাশ মেমো ও ট্র্যাকিং স্লিপ ***'),
    line,
    row(`অর্ডার নং:`, data.orderNo),
    row(`কাপড় ট্যাগ:`, `[ ${data.fabricTagCode} ]`),
    row(`তারিখ:`, new Date().toLocaleDateString('bn-BD')),
    row(`ডেলিভারি:`, new Date(data.deliveryDate).toLocaleDateString('bn-BD')),
    line,
    `গ্রাহক: ${data.customerName}`,
    `মোবাইল: ${data.customerPhone}`,
    line,
    row('পোশাকের বিবরণ', 'মূল্য'),
    line,
    ...data.items.map((i) => row(`${i.name} x ${i.quantity}`, `৳ ${i.price}`)),
    line,
    row('মোট বিল:', `৳ ${data.totalPrice}`),
    row('জমা (অগ্রিম):', `৳ ${data.advancePaid}`),
    row('বকেয়া টাকা:', `৳ ${data.dueAmount}`),
    doubleLine,
    center('লাইভ অর্ডার ট্র্যাক করতে লিংক:'),
    center(data.trackingUrl),
    line,
    center('সেলাই সাথী ব্যবহারের জন্য ধন্যবাদ!'),
    '\n\n\n', // Paper cut feed space
  ].join('\n');
}
