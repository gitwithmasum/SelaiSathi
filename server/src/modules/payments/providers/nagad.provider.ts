import {
  IMfsProvider,
  MfsInitiateOptions,
  MfsInitiateResult,
  MfsVerifyResult,
} from '../mfs.interface.js';

export class NagadProvider implements IMfsProvider {
  name = 'NAGAD' as const;
  private merchantId: string;
  private publicKey: string;
  private privateKey: string;
  private baseUrl: string;

  constructor(options?: {
    merchantId?: string;
    publicKey?: string;
    privateKey?: string;
    isSandbox?: boolean;
  }) {
    this.merchantId = options?.merchantId || process.env.NAGAD_MERCHANT_ID || '';
    this.publicKey = options?.publicKey || process.env.NAGAD_PUBLIC_KEY || '';
    this.privateKey = options?.privateKey || process.env.NAGAD_PRIVATE_KEY || '';
    this.baseUrl = options?.isSandbox !== false
      ? 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs'
      : 'https://api.mynagad.com/api/dfs';
  }

  async initiatePayment(options: MfsInitiateOptions): Promise<MfsInitiateResult> {
    const paymentId = `nagad_pay_${Date.now()}`;
    const checkoutUrl = `https://sandbox.mynagad.com/payment/${paymentId}?amount=${options.amount}&order=${options.orderNo}`;

    return {
      success: true,
      gateway: this.name,
      paymentId,
      checkoutUrl,
    };
  }

  async verifyPayment(paymentId: string, additionalParams?: any): Promise<MfsVerifyResult> {
    const trxId = additionalParams?.trxId || `NAGAD_TRX_${Date.now()}`;

    return {
      success: true,
      trxId,
      amount: additionalParams?.amount || 500,
      paidAt: new Date(),
      status: 'COMPLETED',
    };
  }
}
