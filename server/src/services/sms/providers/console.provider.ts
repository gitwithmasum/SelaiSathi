import { ISmsProvider, SmsSendOptions, SmsSendResult } from '../sms.interface.js';

export class ConsoleSmsProvider implements ISmsProvider {
  name = 'CONSOLE';

  async sendSms(options: SmsSendOptions): Promise<SmsSendResult> {
    const divider = '='.repeat(60);
    console.log(`\n${divider}`);
    console.log(`[SMS DISPATCH - MOCK CONSOLE PROVIDER]`);
    console.log(`To:      ${options.to}`);
    console.log(`Purpose: ${options.purpose}`);
    console.log(`Time:    ${new Date().toISOString()}`);
    console.log(`Message:\n${options.message}`);
    console.log(`${divider}\n`);

    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      provider: this.name,
      cost: 0.0,
    };
  }
}
