import React from 'react';

export interface BankInfo {
  name: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
  icon: React.ReactNode;
}

// List of the most famous and well-known Brazilian banks
export const FAMOUS_BANKS: BankInfo[] = [
  {
    name: 'Nubank',
    bgColor: '#820ad1',
    textColor: '#ffffff',
    icon: <span className="font-black text-xs tracking-tighter lowercase">nu</span>
  },
  {
    name: 'Itaú',
    bgColor: '#ec7000',
    textColor: '#ffffff',
    icon: <span className="font-extrabold text-[11px] tracking-tight">itau</span>
  },
  {
    name: 'Bradesco',
    bgColor: '#cc092f',
    textColor: '#ffffff',
    icon: (
      <div className="flex items-center gap-0.5">
        <span className="w-1.5 h-3 rounded-t-full border border-white"></span>
        <span className="w-2.5 h-3.5 rounded-t-full border border-white"></span>
      </div>
    )
  },
  {
    name: 'Banco do Brasil',
    bgColor: '#fcee21',
    textColor: '#003882',
    icon: <span className="font-black text-[11px] text-[#003882] tracking-tighter">BB</span>
  },
  {
    name: 'Caixa',
    bgColor: '#005ca9',
    textColor: '#ffffff',
    icon: (
      <span className="font-black text-[11px] tracking-tight text-white flex items-center">
        X<span className="text-amber-400 font-bold">A</span>
      </span>
    )
  },
  {
    name: 'Santander',
    bgColor: '#ec0000',
    textColor: '#ffffff',
    icon: (
      <div className="flex items-center gap-0.5">
        <span className="w-1 h-3 rounded-full bg-white rotate-12"></span>
        <span className="w-1.5 h-3.5 rounded-full bg-white"></span>
        <span className="w-1 h-3 rounded-full bg-white -rotate-12"></span>
      </div>
    )
  },
  {
    name: 'Inter',
    bgColor: '#ff7a00',
    textColor: '#ffffff',
    icon: <span className="font-extrabold text-[10px] tracking-tight">inter</span>
  },
  {
    name: 'C6 Bank',
    bgColor: '#1f2421',
    textColor: '#ffffff',
    icon: <span className="font-black text-[10px] tracking-tight">C6</span>
  },
  {
    name: 'Mercado Pago',
    bgColor: '#009ee3',
    textColor: '#ffffff',
    icon: (
      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z" />
      </svg>
    )
  },
  {
    name: 'PicPay',
    bgColor: '#11c76f',
    textColor: '#ffffff',
    icon: <span className="font-black text-xs tracking-tight">P</span>
  },
  {
    name: 'PagBank',
    bgColor: '#00a868',
    textColor: '#ffffff',
    icon: <span className="font-extrabold text-[10px] tracking-tight">pag</span>
  },
  {
    name: 'BTG Pactual',
    bgColor: '#001e38',
    textColor: '#ffffff',
    icon: <span className="font-bold text-[9px] tracking-tighter">BTG</span>
  }
];

// Bank badges for PIX instant payment
export const BankLogosRow: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-[11px] font-bold text-neutral-800 flex items-center gap-1.5">
          <span>Pague pelo aplicativo de qualquer banco:</span>
        </span>
        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Aprovação Imediata
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
        {FAMOUS_BANKS.map((b) => (
          <div
            key={b.name}
            title={`Pague via PIX pelo app do ${b.name}`}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-neutral-200 bg-white shadow-2xs hover:border-neutral-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shadow-xs transition-transform group-hover:scale-110"
              style={{ backgroundColor: b.bgColor, color: b.textColor }}
            >
              {b.icon}
            </div>
            <span className="text-[10px] font-semibold text-neutral-700 truncate max-w-full mt-1.5">
              {b.name}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-neutral-500 text-center mt-2 font-medium">
        + Qualquer banco ou conta digital que tenha PIX é aceito
      </p>
    </div>
  );
};

// Payment brand badges strictly matching IMG_9656.PNG and user screenshot
export const PaymentBrandBadges: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      
      {/* Aura */}
      <div className="h-6 px-2 bg-white border border-neutral-300 rounded flex items-center justify-center shadow-2xs">
        <span className="text-[9px] font-bold tracking-tight text-neutral-800">
          <span className="text-red-600 font-black">au</span>ra
        </span>
      </div>

      {/* Discover */}
      <div className="h-6 px-2 bg-white border border-neutral-300 rounded flex items-center justify-center shadow-2xs">
        <span className="text-[8px] font-extrabold text-neutral-800 flex items-center">
          DISC<span className="w-2 h-2 rounded-full bg-orange-500 inline-block mx-0.5"></span>VER
        </span>
      </div>

      {/* Mastercard */}
      <div className="h-6 px-2 bg-white border border-neutral-300 rounded flex items-center justify-center shadow-2xs">
        <div className="flex -space-x-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-red-600"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-amber-400 opacity-90"></div>
        </div>
      </div>

      {/* Hipercard */}
      <div className="h-6 px-2 bg-white border border-neutral-300 rounded flex items-center justify-center shadow-2xs">
        <span className="text-[8px] font-black italic bg-red-600 text-white px-1 py-0.5 rounded-xs">
          Hipercard
        </span>
      </div>

      {/* Diners Club */}
      <div className="h-6 px-2 bg-white border border-neutral-300 rounded flex items-center justify-center shadow-2xs">
        <span className="text-[9px] font-bold text-blue-900 tracking-tight">Diners</span>
      </div>

      {/* Visa */}
      <div className="h-6 px-2 bg-white border border-neutral-300 rounded flex items-center justify-center shadow-2xs">
        <span className="text-[9px] font-black text-blue-800 italic tracking-wider">
          VISA
        </span>
      </div>

      {/* American Express */}
      <div className="h-6 px-2 bg-white border border-neutral-300 rounded flex items-center justify-center shadow-2xs">
        <span className="text-[8px] font-extrabold text-[#006fcf] bg-[#006fcf]/10 px-1 rounded-xs">
          AMEX
        </span>
      </div>

      {/* PIX */}
      <div className="h-6 px-2 bg-emerald-50 border border-emerald-500 rounded flex items-center gap-1 shadow-2xs">
        <svg viewBox="0 0 512 512" className="w-3.5 h-3.5" fill="#32bcad">
          <path d="M123.6 138.5l92.4 92.4c11 11 29 11 40 0l92.4-92.4c37.5-37.5 98.4-37.5 135.9 0 37.5 37.5 37.5 98.4 0 135.9l-92.4 92.4c-11 11-11 29 0 40l92.4 92.4c37.5 37.5 37.5 98.4 0 135.9-37.5 37.5-98.4 37.5-135.9 0l-92.4-92.4c-11-11-29-11-40 0l-92.4 92.4c-37.5 37.5-98.4 37.5-135.9 0-37.5-37.5-37.5-98.4 0-135.9l92.4-92.4c11-11 11-29 0-40l-92.4-92.4c-37.5-37.5-37.5-98.4 0-135.9 37.5-37.5 98.4-37.5 135.9 0z" />
        </svg>
        <span className="text-[9px] font-black text-emerald-900 uppercase">pix</span>
      </div>

      {/* Elo */}
      <div className="h-6 px-2 bg-white border border-neutral-300 rounded flex items-center justify-center shadow-2xs">
        <div className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          <span className="text-[9px] font-black text-neutral-900 ml-0.5 lowercase">elo</span>
        </div>
      </div>

    </div>
  );
};
