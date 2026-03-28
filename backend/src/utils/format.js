export function toNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number.parseFloat(value);
  if (value && typeof value.toNumber === 'function') return value.toNumber();
  return 0;
}

export function whatsappLink(phone, text) {
  const normalized = phone.replace(/\D/g, '');
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}
