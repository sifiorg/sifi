import { test, expect } from 'vitest';
import { firstAndLast } from '../firstAndLast';

test('should return the same string when length is less than or equal to first + last', () => {
  expect(firstAndLast('12345678', 4, 4)).toBe('12345678');
});

test('should return a string with dots in the middle when length is greater than first + last', () => {
  expect(firstAndLast('123456789', 4, 4)).toBe('1234...6789');
});

test('should return a string with custom middle when provided', () => {
  expect(firstAndLast('123456789', 4, 4, '---')).toBe('1234---6789');
});
