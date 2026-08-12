'use client';

import { useState, useCallback } from 'react';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
}

export function useFormValidation(initialValues: Record<string, string>) {
  const [fields, setFields] = useState<Record<string, FieldState>>(() => {
    const initial: Record<string, FieldState> = {};
    for (const key of Object.keys(initialValues)) {
      initial[key] = { value: initialValues[key], error: null, touched: false };
    }
    return initial;
  });

  const validate = useCallback((name: string, value: string, rules?: ValidationRules): string | null => {
    if (!rules) return null;
    if (rules.required && !value.trim()) return 'This field is required';
    if (rules.minLength && value.length < rules.minLength) return `Minimum ${rules.minLength} characters`;
    if (rules.maxLength && value.length > rules.maxLength) return `Maximum ${rules.maxLength} characters`;
    if (rules.pattern && !rules.pattern.test(value)) return 'Invalid format';
    if (rules.custom) return rules.custom(value);
    return null;
  }, []);

  const setValue = useCallback((name: string, value: string, rules?: ValidationRules) => {
    const error = validate(name, value, rules);
    setFields((prev) => ({ ...prev, [name]: { value, error, touched: true } }));
  }, [validate]);

  const getFieldProps = useCallback((name: string, rules?: ValidationRules) => ({
    value: fields[name]?.value || '',
    error: fields[name]?.touched ? fields[name]?.error : null,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValue(name, e.target.value, rules),
  }), [fields, setValue]);

  const isValid = Object.values(fields).every((f) => !f.error);

  return { fields, setValue, getFieldProps, isValid };
}