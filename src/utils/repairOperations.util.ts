export function toDateTimeLocalValue(date: Date = new Date()): string {
  const offsetMilliseconds = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMilliseconds).toISOString().slice(0, 16);
}

export function toIsoDateTime(localDateTime: string): string {
  return new Date(localDateTime).toISOString();
}
