export interface SmsSendOptions {
  to: string; // Recipient phone e.g. +8801711000000
  message: string;
  purpose: 'OTP' | 'ORDER_UPDATE' | 'DUE_REMINDER' | 'INVITE' | 'GENERAL';
}

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  cost?: number;
  error?: string;
}

export interface ISmsProvider {
  name: string;
  sendSms(options: SmsSendOptions): Promise<SmsSendResult>;
}
