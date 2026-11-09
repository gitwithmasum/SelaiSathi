import { config } from '../../config/index.js';
import prisma from '../../config/database.js';
import { ISmsProvider, SmsSendOptions, SmsSendResult } from './sms.interface.js';
import { ConsoleSmsProvider } from './providers/console.provider.js';
import { GreenwebSmsProvider } from './providers/greenweb.provider.js';
import { ReveSmsProvider } from './providers/reve.provider.js';

class SmsService {
  private provider: ISmsProvider;

  constructor() {
    this.provider = this.resolveProvider();
  }

  private resolveProvider(): ISmsProvider {
    switch (config.sms.provider) {
      case 'GREENWEB':
        return new GreenwebSmsProvider(config.sms.apiKey);
      case 'REVE':
        return new ReveSmsProvider(
          config.sms.apiKey,
          config.sms.apiSecret,
          config.sms.senderId
        );
      case 'CONSOLE':
      default:
        return new ConsoleSmsProvider();
    }
  }

  async send(options: SmsSendOptions): Promise<SmsSendResult> {
    const result = await this.provider.sendSms(options);

    // Save to audit log asynchronously
    try {
      await prisma.smsLog.create({
        data: {
          phone: options.to,
          purpose: options.purpose,
          provider: result.provider,
          status: result.success ? 'SENT' : 'FAILED',
          cost: result.cost || 0.0,
        },
      });
    } catch (logErr) {
      console.error('Failed to write to SmsLog:', logErr);
    }

    return result;
  }

  async sendOtp(phone: string, otp: string): Promise<SmsSendResult> {
    const message = `[সেলাই সাথী] আপনার ওটিপি (OTP) কোড হলো: ${otp}। এটি ৫ মিনিট কার্যকর থাকবে। কারো সাথে শেয়ার করবেন না।`;
    return this.send({
      to: phone,
      message,
      purpose: 'OTP',
    });
  }

  async sendCustomerInvite(options: {
    customerPhone: string;
    shopName: string;
    shopCode: string;
  }): Promise<SmsSendResult> {
    const message = `[সেলাই সাথী] "${options.shopName}" আপনাকে সেলাই সাথীতে যুক্ত করেছে। আপনার মাপ ও অর্ডারের আপডেট লাইভ দেখতে অ্যাপ ডাউনলোড করুন বা শপ কোড (${options.shopCode}) ব্যবহার করুন।`;
    return this.send({
      to: options.customerPhone,
      message,
      purpose: 'INVITE',
    });
  }
}

export const smsService = new SmsService();
export default smsService;
