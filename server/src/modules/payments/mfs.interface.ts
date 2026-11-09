export interface MfsInitiateOptions {
  orderId: string;
  orderNo: string;
  amount: number;
  customerPhone: string;
  callbackUrl: string;
}

export interface MfsInitiateResult {
  success: boolean;
  gateway: 'BKASH' | 'NAGAD';
  paymentId: string;
  checkoutUrl: string;
  error?: string;
}

export interface MfsVerifyResult {
  success: boolean;
  trxId: string;
  amount: number;
  paidAt: Date;
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED';
  rawResponse?: any;
}

export interface IMfsProvider {
  name: 'BKASH' | 'NAGAD';
  initiatePayment(options: MfsInitiateOptions): Promise<MfsInitiateResult>;
  verifyPayment(paymentId: string, additionalParams?: any): Promise<MfsVerifyResult>;
}
