export const validators = {
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  password: (value: string) => value.length >= 6,
  username: (value: string) => value.length >= 3,
  required: (value: string) => value.trim().length > 0,
  url: (value: string) => { try { new URL(value); return true; } catch { return false; } },
};