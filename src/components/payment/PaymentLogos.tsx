'use client';

import React, { useState } from 'react';

export const PAYMENT_IMAGE_PATHS: Record<string, string> = {
  bkash: '/payment-icon/bkash.jpeg',
  nagad: '/payment-icon/nogod.jpeg',
  rocket: '/payment-icon/rocket.png',
  bank: '/payment-icon/card.jpeg',
  card: '/payment-icon/card.jpeg',
  usdt: '/payment-icon/usd.jpeg',
  crypto: '/payment-icon/usd.jpeg',
};

export function BKashIcon({ className = 'w-6 h-6' }: { className?: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src="/payment-icon/bkash.jpeg"
        alt="bKash"
        onError={() => setImgError(true)}
        className={`${className} object-contain bg-white rounded-lg p-0.5`}
      />
    );
  }

  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#E2136E" />
      <path d="M22 68L48 24L74 48L44 48L22 68Z" fill="#FFFFFF" />
      <path d="M48 24L78 32L62 52L48 24Z" fill="#FFFFFF" fillOpacity="0.85" />
      <path d="M44 48L74 48L58 72L44 48Z" fill="#FFFFFF" fillOpacity="0.9" />
      <path d="M22 68L44 48L36 78L22 68Z" fill="#FFFFFF" fillOpacity="0.75" />
    </svg>
  );
}

export function NagadIcon({ className = 'w-6 h-6' }: { className?: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src="/payment-icon/nogod.jpeg"
        alt="Nagad"
        onError={() => setImgError(true)}
        className={`${className} object-contain bg-white rounded-lg p-0.5`}
      />
    );
  }

  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#F7921E" />
      <path
        d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C69.33 85 85 69.33 85 50C85 30.67 69.33 15 50 15ZM50 73C37.3 73 27 62.7 27 50C27 37.3 37.3 27 50 27C62.7 27 73 37.3 73 50C73 62.7 62.7 73 50 73Z"
        fill="#ED1C24"
      />
      <path
        d="M50 27C37.3 27 27 37.3 27 50C27 62.7 37.3 73 50 73C62.7 73 73 62.7 73 50C73 37.3 62.7 27 50 27ZM58 58L42 58L50 38L58 58Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function RocketIcon({ className = 'w-6 h-6' }: { className?: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src="/payment-icon/rocket.png"
        alt="Rocket"
        onError={() => setImgError(true)}
        className={`${className} object-contain bg-[#8C3494] rounded-lg p-0.5`}
      />
    );
  }

  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#8C3494" />
      <path
        d="M50 20C50 20 65 35 65 55C65 65 58 72 50 75C42 72 35 65 35 55C35 35 50 20 50 20Z"
        fill="#FFFFFF"
      />
      <circle cx="50" cy="45" r="7" fill="#8C3494" />
      <path d="M32 58L22 68L35 66L32 58Z" fill="#FFC107" />
      <path d="M68 58L78 68L65 66L68 58Z" fill="#FFC107" />
      <path d="M50 75L45 85L50 82L55 85L50 75Z" fill="#FF5722" />
    </svg>
  );
}

export function CardIcon({ className = 'w-6 h-6' }: { className?: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src="/payment-icon/card.jpeg"
        alt="Bank Card"
        onError={() => setImgError(true)}
        className={`${className} object-contain bg-white rounded-lg p-0.5`}
      />
    );
  }

  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#1A1F36" />
      <rect x="15" y="30" width="70" height="42" rx="6" fill="#252D4A" stroke="#3A4668" strokeWidth="2" />
      <rect x="15" y="40" width="70" height="8" fill="#0F1424" />
      <circle cx="62" cy="58" r="7" fill="#EB001B" fillOpacity="0.9" />
      <circle cx="70" cy="58" r="7" fill="#F79E1B" fillOpacity="0.9" />
      <path d="M25 55L28 62H31L34 55H31.5L29.5 60L27.5 55H25Z" fill="#FFFFFF" />
    </svg>
  );
}

export function UsdtIcon({ className = 'w-6 h-6' }: { className?: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src="/payment-icon/usd.jpeg"
        alt="USDT Crypto"
        onError={() => setImgError(true)}
        className={`${className} object-contain bg-white rounded-lg p-0.5`}
      />
    );
  }

  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#26A17B" />
      <path
        d="M57.5 35V28H42.5V35H27V42H42.5V47.5C33.8 47.1 27.5 45.4 27.5 43.3C27.5 40.8 37.6 39 50 39C62.4 39 72.5 40.8 72.5 43.3C72.5 45.4 66.2 47.1 57.5 47.5V42H73V35H57.5ZM50 63C38 63 28.3 61.4 27.5 59.4V49.6C32.8 52 40.9 53.5 50 53.5C59.1 53.5 67.2 52 72.5 49.6V59.4C71.7 61.4 62 63 50 63ZM50 71.5C46 71.5 42.5 71.3 42.5 71.3V65.1C44.9 65.4 47.4 65.5 50 65.5C52.6 65.5 55.1 65.4 57.5 65.1V71.3C57.5 71.3 54 71.5 50 71.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function ZenovWalletIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#3B82F6" />
      <path d="M30 30H70V70H30V30Z" fill="#1E293B" rx="6" />
      <path
        d="M36 42H64L42 60H64"
        stroke="#60A5FA"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PaymentLogo({
  method,
  className = 'w-7 h-7',
}: {
  method: string;
  className?: string;
}) {
  const m = (method || '').toLowerCase();
  if (m.includes('bkash')) return <BKashIcon className={className} />;
  if (m.includes('nagad') || m.includes('nogod')) return <NagadIcon className={className} />;
  if (m.includes('rocket')) return <RocketIcon className={className} />;
  if (m.includes('bank') || m.includes('card') || m.includes('visa') || m.includes('mastercard')) {
    return <CardIcon className={className} />;
  }
  if (m.includes('usdt') || m.includes('crypto') || m.includes('usd') || m.includes('binance')) {
    return <UsdtIcon className={className} />;
  }
  if (m.includes('zenov') || m.includes('wallet')) return <ZenovWalletIcon className={className} />;
  return <CardIcon className={className} />;
}

