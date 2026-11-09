import { ISmsProvider, SmsSendOptions, SmsSendResult } from '../sms.interface.js';

export class GreenwebSmsProvider implements ISmsProvider {
  name = 'GREENWEB';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async sendSms(options: SmsSendOptions): Promise<SmsSendResult> {
    try {
      // Greenweb accepts format without +: 88017XXXXXXXX
      const normalized = options.to.replace('+', '');
      const url = `http://api.greenweb.com.bd/api.php?token=${encodeURIComponent(
        this.token
      )}&to=${encodeURIComponent(normalized)}&message=${encodeURIComponent(
        options.message
      )}`;

      const response = await fetch(url);
      const text = await response.text();

      if (text.includes('Ok') || text.includes('Success')) {
        return {
          success: true,
          messageId: text.trim(),
          provider: this.name,
          cost: 0.35, // Typical cost per SMS in BDT
        };
      }

      return {
        success: false,
        provider: this.name,
        error: text || 'Greenweb API error',
      };
    } catch (err: any) {
      return {
        success: false,
        provider: this.name,
        error: err.message || 'Network error communicating with Greenweb SMS',
      };
    }
  }
}
