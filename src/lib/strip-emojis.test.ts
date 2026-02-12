import { describe, it, expect } from 'vitest';
import { stripEmojis } from './strip-emojis';

describe('stripEmojis', () => {
  it('should remove common emojis', () => {
    expect(stripEmojis('Hello 🔥 World ✅')).toBe('Hello World');
  });

  it('should preserve Korean text', () => {
    expect(stripEmojis('안녕하세요! 🔥 SAT 준비')).toBe('안녕하세요! SAT 준비');
  });

  it('should preserve English and numbers', () => {
    expect(stripEmojis('Test 123 ABC 🎉')).toBe('Test 123 ABC');
  });

  it('should handle multiple emojis', () => {
    expect(stripEmojis('1. 핵심 포인트 🔥✅🎯')).toBe('1. 핵심 포인트');
  });

  it('should preserve punctuation', () => {
    expect(stripEmojis('정말 중요해요! ✅ 반드시 기억하세요.')).toBe(
      '정말 중요해요! 반드시 기억하세요.'
    );
  });

  it('should handle text without emojis', () => {
    expect(stripEmojis('Plain text without emojis')).toBe(
      'Plain text without emojis'
    );
  });

  it('should normalize whitespace', () => {
    expect(stripEmojis('Hello  🔥  World   ✅  Test')).toBe('Hello World Test');
  });
});
