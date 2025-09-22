import { parseExpression } from 'cron-parser';

export interface CronParseResult {
  isValid: boolean;
  humanReadable: string;
  nextRuns: string[];
  error?: string;
}

export interface CronStats {
  expression: string;
  isValid: boolean;
  nextRunCount: number;
  humanReadable: string;
  error?: string;
}

/**
 * Parse a cron expression and return human-readable description
 */
export function parseCronExpression(expression: string): CronParseResult {
  try {
    // Validate and parse the cron expression
    const interval = parseExpression(expression);

    // Generate human-readable description
    const humanReadable = generateHumanReadable(expression);

    // Get next 5 execution times
    const nextRuns: string[] = [];
    for (let i = 0; i < 5; i++) {
      const next = interval.next();
      nextRuns.push(next.toISOString());
    }

    return {
      isValid: true,
      humanReadable,
      nextRuns
    };
  } catch (error) {
    return {
      isValid: false,
      humanReadable: '',
      nextRuns: [],
      error: error instanceof Error ? error.message : 'Invalid cron expression'
    };
  }
}

/**
 * Validate a cron expression
 */
export function validateCronExpression(expression: string): boolean {
  try {
    parseExpression(expression);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get next execution time for a cron expression
 */
export function getNextCronRun(expression: string): Date | null {
  try {
    const interval = parseExpression(expression);
    return interval.next().toDate();
  } catch {
    return null;
  }
}

/**
 * Get multiple next execution times
 */
export function getNextCronRuns(expression: string, count: number = 5): Date[] {
  try {
    const interval = parseExpression(expression);
    const runs: Date[] = [];

    for (let i = 0; i < count; i++) {
      const next = interval.next();
      runs.push(next.toDate());
    }

    return runs;
  } catch {
    return [];
  }
}

/**
 * Generate human-readable description of cron expression
 */
function generateHumanReadable(expression: string): string {
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 5) {
    return 'Invalid cron expression format';
  }

  const [minute, hour, day, month, weekday] = parts;

  // Handle special cases
  if (expression === '* * * * *') {
    return 'Every minute';
  }

  if (expression === '0 * * * *') {
    return 'Every hour';
  }

  if (expression === '0 0 * * *') {
    return 'Every day at midnight';
  }

  if (expression === '0 0 * * 0') {
    return 'Every Sunday at midnight';
  }

  if (expression === '0 0 1 * *') {
    return 'Every month on the 1st at midnight';
  }

  // Generate custom description
  let description = '';

  // Minute
  if (minute === '*') {
    description += 'every minute';
  } else if (minute === '0') {
    description += 'at the top of the hour';
  } else {
    description += `at minute ${minute}`;
  }

  // Hour
  if (hour !== '*') {
    if (description) description += ' ';
    if (hour === '0') {
      description += 'at midnight';
    } else {
      description += `at ${hour}:00`;
    }
  }

  // Day
  if (day !== '*') {
    if (description) description += ' ';
    description += `on day ${day}`;
  }

  // Month
  if (month !== '*') {
    if (description) description += ' ';
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = parseInt(month) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      description += `in ${monthNames[monthIndex]}`;
    } else {
      description += `in month ${month}`;
    }
  }

  // Weekday
  if (weekday !== '*') {
    if (description) description += ' ';
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = parseInt(weekday);
    if (dayIndex >= 0 && dayIndex < 7) {
      description += `on ${dayNames[dayIndex]}`;
    } else {
      description += `on weekday ${weekday}`;
    }
  }

  return description || 'Custom schedule';
}

/**
 * Get statistics for a cron expression
 */
export function getCronStats(expression: string): CronStats {
  const parseResult = parseCronExpression(expression);

  return {
    expression,
    isValid: parseResult.isValid,
    nextRunCount: parseResult.nextRuns.length,
    humanReadable: parseResult.humanReadable,
    error: parseResult.error
  };
}
