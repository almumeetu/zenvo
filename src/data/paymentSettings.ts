export interface PaymentAccount {
  id: string;
  name: string;
  type: string;
  number: string;
  instruction: string;
  feePercent?: number;
  whatsapp?: string;
}

export const PAYMENT_ACCOUNTS: Record<string, PaymentAccount> = {
  bKash: {
    id: 'bKash',
    name: 'bKash',
    type: 'Personal (Send Money)',
    number: '01886123456',
    whatsapp: '8801300529836',
    instruction: 'bKash App বা *247# থেকে Send Money অপশনে গিয়ে উপরের নাম্বারে টাকা পাঠান। এরপর TrxID ও যে নাম্বার থেকে টাকা পাঠিয়েছেন তা নিচে লিখুন।',
  },
  Nagad: {
    id: 'Nagad',
    name: 'Nagad',
    type: 'Personal (Send Money)',
    number: '01712345678',
    whatsapp: '8801300529836',
    instruction: 'Nagad App বা *167# থেকে Send Money অপশনে গিয়ে উপরের নাম্বারে টাকা পাঠান। পেমেন্ট শেষে TrxID ও সেন্ডার নাম্বার নিচে দিন।',
  },
  Rocket: {
    id: 'Rocket',
    name: 'Rocket',
    type: 'Personal (Send Money)',
    number: '01912345678-9',
    whatsapp: '8801300529836',
    instruction: 'Rocket App বা *322# থেকে Send Money করুন এবং ট্রানজেকশন আইডি নিচে বসিয়ে কনফার্ম করুন।',
  },
  'Bank Transfer': {
    id: 'Bank Transfer',
    name: 'Bank Transfer',
    type: 'Local Bank (City / Brac / Islami Bank)',
    number: 'City Bank A/C: 22039485710 (Zenov Gaming Enterprise)',
    whatsapp: '8801300529836',
    instruction: 'যেকোনো লকাল ব্যাংক থেকে ফান্ড ট্রান্সফার করুন এবং রেফারেন্স বা ট্রানজেকশন স্লিপ নাম্বারটি নিচে ইনপুট করুন।',
  },
  'Crypto/USDT': {
    id: 'Crypto/USDT',
    name: 'USDT (TRC20)',
    type: 'TRC-20 Wallet Address',
    number: 'TYu83jkLm9PqRsTuVwXyZ1234567890abc',
    whatsapp: '8801300529836',
    instruction: 'Send exact USDT amount to this TRC20 address. Paste the transaction TXID hash below for instant verification.',
  },
};
