export function parseMoneyInputValue(displayValue: string): string {
  const sanitized = displayValue.replace(/[^\d.,]/g, "");
  if (!sanitized) return "";

  if (sanitized.includes(",")) {
    const [integerPart, ...decimalParts] = sanitized.split(",");
    const integerDigits = integerPart.replace(/\D/g, "") || "0";
    const decimalDigits = decimalParts.join("").replace(/\D/g, "").slice(0, 2);
    return `${Number(integerDigits)}.${decimalDigits}`;
  }

  const digits = sanitized.replace(/\D/g, "");
  return digits ? String(Number(digits)) : "";
}

export function formatMoneyInputValue(rawValue: string | number): string {
  const value = String(rawValue);
  if (!value) return "";

  const [integerPart, decimalPart] = value.split(".");
  const integerDigits = integerPart.replace(/\D/g, "") || "0";
  const groupedInteger = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decimalPart === undefined ? groupedInteger : `${groupedInteger},${decimalPart.slice(0, 2)}`;
}
