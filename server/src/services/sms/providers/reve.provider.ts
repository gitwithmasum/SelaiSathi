import { ISmsProvider, SmsSendOptions, SmsSendResult } from '../sms.interface.js';

export class ReveSmsProvider implements ISmsProvider {
  name = 'REVE';
  private apiKey: string;
  private apiSecret: string;
  private senderId: string;

  constructor(apiKey: string, apiSecret: string, senderId: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.senderId = senderId;
  }

  async sendSms(options: SmsSendOptions): Promise<SmsSendResult> {
    try {
      const normalized = options.to.replace('+', '');
      const url = 'https://smpp.revesms.com:7790/sendtext';
      
      const params = new URLSearchParams({
        apikey: this.apiKey,
        secretkey: this.apiSecret,
        callerID: this.senderId,
        toUser: normalized,
        messageContent: options.message,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = (await response.json()) as any;

      if (data && data.Status === '0') {
        return {
          success: true,
          messageId: data.Message_ID || `reve_${Date.now()}`,
          provider: this.name,
          cost: 0.38,
        };
      }

      return {
        success: false,
        provider: this.name,
        error: data?.Text || 'Reve SMS API failed',
      };
    } catch (err: any) {
      return {
        success: false,
        provider: this.name,
        error: err.message || 'Reve SMS request failed',
      };
    }
  }
}
