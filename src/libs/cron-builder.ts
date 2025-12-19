import { parseExpression } from 'cron-parser';
import type { CronBuilderOptions, CronFieldValue } from '@/config/cron-builder-config';

/**
 * Build a cron expression from builder options
 */
export function buildCronExpression(options: CronBuilderOptions): string {
  const minute = buildFieldExpression(options.minute, 0, 59);
  const hour = buildFieldExpression(options.hour, 0, 23);
  const day = buildFieldExpression(options.day, 1, 31);
  const month = buildFieldExpression(options.month, 1, 12);
  const weekday = buildFieldExpression(options.weekday, 0, 6);

  return `${minute} ${hour} ${day} ${month} ${weekday}`;
}

/**
 * Build a single cron field expression from field value
 */
function buildFieldExpression(field: CronFieldValue, min: number, max: number): string {
  switch (field.type) {
    case 'every':
      return '*';

    case 'specific':
      if (field.value === undefined) return '*';
      const value = typeof field.value === 'number' ? field.value : parseInt(field.value.toString());
      if (isNaN(value) || value < min || value > max) return '*';
      return value.toString();

    case 'range':
      if (field.start === undefined || field.end === undefined) return '*';
      const start = field.start < min ? min : field.start > max ? max : field.start;
      const end = field.end < min ? min : field.end > max ? max : field.end;
      if (start > end) return '*';
      return `${start}-${end}`;

    case 'step':
      if (field.step === undefined) return '*';
      const step = field.step < 1 ? 1 : field.step;
      return `*/${step}`;

    case 'list':
      if (!field.list || field.list.length === 0) return '*';
      // Filter valid values and sort
      const validValues = field.list
        .filter(v => !isNaN(v) && v >= min && v <= max)
        .sort((a, b) => a - b);
      if (validValues.length === 0) return '*';
      return validValues.join(',');

    default:
      return '*';
  }
}

/**
 * Validate a cron expression
 */
export function validateCronExpression(expression: string): { isValid: boolean; error?: string } {
  try {
    // Try to parse it to ensure it's actually valid
    parseExpression(expression);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid cron expression'
    };
  }
}

/**
 * Parse a cron expression back into builder options
 * This is useful for editing existing expressions
 */
export function parseCronToBuilder(expression: string): CronBuilderOptions | null {
  try {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      return null;
    }

    return {
      minute: parseField(parts[0], 0, 59),
      hour: parseField(parts[1], 0, 23),
      day: parseField(parts[2], 1, 31),
      month: parseField(parts[3], 1, 12),
      weekday: parseField(parts[4], 0, 6)
    };
  } catch {
    return null;
  }
}

/**
 * Parse a single cron field into CronFieldValue
 */
function parseField(field: string, min: number, max: number): CronFieldValue {
  // Every
  if (field === '*') {
    return { type: 'every' };
  }

  // Step: */n
  if (field.startsWith('*/')) {
    const step = parseInt(field.substring(2));
    if (!isNaN(step) && step > 0) {
      return { type: 'step', step };
    }
    return { type: 'every' };
  }

  // Range: n-m
  if (field.includes('-') && !field.includes(',')) {
    const [startStr, endStr] = field.split('-');
    const start = parseInt(startStr);
    const end = parseInt(endStr);
    if (!isNaN(start) && !isNaN(end) && start >= min && end <= max && start <= end) {
      return { type: 'range', start, end };
    }
  }

  // List: n,m,o
  if (field.includes(',')) {
    const values = field
      .split(',')
      .map(v => parseInt(v.trim()))
      .filter(v => !isNaN(v) && v >= min && v <= max);
    if (values.length > 0) {
      return { type: 'list', list: values };
    }
  }

  // Specific value
  const value = parseInt(field);
  if (!isNaN(value) && value >= min && value <= max) {
    return { type: 'specific', value };
  }

  // Default to every
  return { type: 'every' };
}

/**
 * Get human-readable description of a field value
 */
export function getFieldDescription(field: CronFieldValue, fieldName: 'minute' | 'hour' | 'day' | 'month' | 'weekday'): string {
  switch (field.type) {
    case 'every':
      return 'Every';

    case 'specific':
      if (field.value === undefined) return 'Every';
      const value = typeof field.value === 'number' ? field.value : parseInt(field.value.toString());
      if (fieldName === 'month' && value >= 1 && value <= 12) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthNames[value - 1];
      }
      if (fieldName === 'weekday' && value >= 0 && value <= 6) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return dayNames[value];
      }
      return value.toString();

    case 'range':
      if (field.start === undefined || field.end === undefined) return 'Every';
      if (fieldName === 'month') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${monthNames[field.start - 1]} - ${monthNames[field.end - 1]}`;
      }
      if (fieldName === 'weekday') {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `${dayNames[field.start]} - ${dayNames[field.end]}`;
      }
      return `${field.start} - ${field.end}`;

    case 'step':
      if (field.step === undefined) return 'Every';
      return `Every ${field.step}`;

    case 'list':
      if (!field.list || field.list.length === 0) return 'Every';
      if (fieldName === 'month') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return field.list.map(v => monthNames[v - 1]).join(', ');
      }
      if (fieldName === 'weekday') {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return field.list.map(v => dayNames[v]).join(', ');
      }
      return field.list.join(', ');

    default:
      return 'Every';
  }
}

