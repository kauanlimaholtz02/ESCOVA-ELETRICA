/**
 * Helper for generating Brazilian PIX Copy & Paste string (BR Code EMV compliant format)
 */
export function generatePixPayload({
  key = "pix@primestore.com.br",
  name = "PRIME STORE COMERCIO",
  city = "SAO PAULO",
  txid = "PRIME" + Math.floor(100000 + Math.random() * 900000),
  amount = 44.79
}: {
  key?: string;
  name?: string;
  city?: string;
  txid?: string;
  amount?: number;
}): string {
  const formatField = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  const amountStr = amount.toFixed(2);
  const merchantAccount = 
    formatField('00', 'BR.GOV.BCB.PIX') +
    formatField('01', key);

  const additionalData = formatField('05', txid);

  let payload = 
    formatField('00', '01') +
    formatField('01', '12') + // 12 = Dynamic/Static QR
    formatField('26', merchantAccount) +
    formatField('52', '0000') +
    formatField('53', '986') + // BRL Currency code
    formatField('54', amountStr) +
    formatField('58', 'BR') +
    formatField('59', name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().slice(0, 25)) +
    formatField('60', city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().slice(0, 15)) +
    formatField('62', additionalData) +
    '6304';

  // CRC16-CCITT calculation
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
  return payload + crcHex;
}

/**
 * Format helpers for CPF, Phone, and CEP
 */
export function formatCPF(val: string): string {
  const clean = val.replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

export function formatPhone(val: string): string {
  let clean = val.replace(/\D/g, '');
  if (clean.startsWith('55') && clean.length > 11) {
    clean = clean.slice(2);
  }
  clean = clean.slice(0, 11);
  if (clean.length === 0) return '';
  if (clean.length <= 2) return `(${clean}`;
  if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
}

export function formatCEP(val: string): string {
  const clean = val.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}

export function validateCPF(cpfRaw: string): boolean {
  const cpf = cpfRaw.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10), 10)) return false;

  return true;
}
