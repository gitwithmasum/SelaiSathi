import { Linking, Alert } from 'react-native';

export interface OrderWhatsAppDetails {
  shopName: string;
  customerName: string;
  customerPhone: string;
  orderNo: string;
  fabricPinTag?: string;
  items: Array<{ name: string; qty?: number }>;
  totalPrice: number;
  advancePaid: number;
  dueAmount: number;
  deliveryDate: string;
  trackingUrl?: string;
}

export const whatsappHelper = {
  /**
   * Format and send order confirmation invoice via WhatsApp
   */
  sendOrderConfirmation(details: OrderWhatsAppDetails) {
    const itemsList = details.items
      .map((it) => `• ${it.name}${it.qty && it.qty > 1 ? ` (${it.qty} টি)` : ''}`)
      .join('\n');

    const formattedDate = new Date(details.deliveryDate).toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const msg =
`আসসালামু আলাইকুম ${details.customerName},
*${details.shopName}* থেকে আপনার সেলাইয়ের অর্ডারটি গ্রহণ করা হয়েছে।

📋 *অর্ডার নং:* ${details.orderNo}
${details.fabricPinTag ? `📌 *কাপড়ের পিন ট্যাগ:* ${details.fabricPinTag}\n` : ''}👕 *পোশাকের বিবরণ:*
${itemsList}

💰 *মোট বিল:* ৳${details.totalPrice}
💵 *অগ্রিম জমা:* ৳${details.advancePaid}
⚠️ *বকেয়া:* ৳${details.dueAmount}
📅 *সম্ভাব্য ডেলিভারি:* ${formattedDate}

${details.trackingUrl ? `📱 *কাজের অবস্থা লাইভ দেখতে ক্লিক করুন:*\n${details.trackingUrl}\n\n` : ''}ধন্যবাদ, আমাদের সাথে থাকার জন্য!`;

    this.openWhatsApp(details.customerPhone, msg);
  },

  /**
   * Send notification when garments are stitched and ready for delivery/trial
   */
  sendOrderReady(details: {
    shopName: string;
    customerName: string;
    customerPhone: string;
    orderNo: string;
    dueAmount: number;
    trackingUrl?: string;
  }) {
    const msg =
`আসসালামু আলাইকুম ${details.customerName},
সুসংবাদ! *${details.shopName}* এ আপনার অর্ডার নং *${details.orderNo}* এর পোশাক তৈরি সম্পন্ন হয়েছে। 🎉

${details.dueAmount > 0 ? `⚠️ *বকেয়া পরিশোধযোগ্য:* ৳${details.dueAmount}\n` : '✓ *বিল সম্পূর্ণ পরিশোধিত!*\n'}
অনুগ্রহ করে সুবিধাজনক সময়ে দোকানে এসে পোশাকের ট্রায়াল দিন এবং সংগ্রহ করুন।

${details.trackingUrl ? `বিস্তারিত দেখতে: ${details.trackingUrl}\n` : ''}ধন্যবাদ!`;

    this.openWhatsApp(details.customerPhone, msg);
  },

  /**
   * Send respectful Bengali due payment reminder
   */
  sendDueReminder(details: {
    shopName: string;
    customerName: string;
    customerPhone: string;
    orderNo: string;
    dueAmount: number;
    mfsNumber?: string;
  }) {
    const msg =
`আসসালামু আলাইকুম ${details.customerName},
*${details.shopName}* থেকে বিনীতভাবে জানানো যাচ্ছে যে, আপনার অর্ডার নং *${details.orderNo}* এর বাকি টাকার পরিমাণ ৳${details.dueAmount}।

${details.mfsNumber ? `📱 বিকাশ বা নগদে পাঠাতে নম্বর: *${details.mfsNumber}*\n` : ''}
পোশাক ডেলিভারি নেওয়ার পূর্বে অনুগ্রহ করে বকেয়া পরিশোধ করুন।
যেকোনো প্রয়োজনে আমাদের কল করুন। ধন্যবাদ!`;

    this.openWhatsApp(details.customerPhone, msg);
  },

  /**
   * Helper to open WhatsApp URL with fallback
   */
  async openWhatsApp(phone: string, message: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const targetPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const encodedMsg = encodeURIComponent(message);
    const url = `whatsapp://send?phone=${targetPhone}&text=${encodedMsg}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback to web link
        await Linking.openURL(`https://wa.me/${targetPhone}?text=${encodedMsg}`);
      }
    } catch {
      Alert.alert('হোয়াটসঅ্যাপ পাওয়া যায়নি', 'আপনার ফোনে হোয়াটসঅ্যাপ ইনস্টল করা আছে কিনা যাচাই করুন');
    }
  },
};

export default whatsappHelper;
