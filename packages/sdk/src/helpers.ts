/**
 * Serializes a value to JSON, converting any BigInts to strings.
 */
export function serializeJson(value: any) {
  return JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v));
}
