import {
    getCronStats,
    getNextCronRun,
    getNextCronRuns,
    parseCronExpression,
    validateCronExpression
} from '../cron-parser';

describe('cron-parser', () => {
  describe('validateCronExpression', () => {
    it('should validate correct cron expressions', () => {
      expect(validateCronExpression('* * * * *')).toBe(true);
      expect(validateCronExpression('0 * * * *')).toBe(true);
      expect(validateCronExpression('0 0 * * *')).toBe(true);
      expect(validateCronExpression('0 0 * * 0')).toBe(true);
      expect(validateCronExpression('*/15 * * * *')).toBe(true);
      expect(validateCronExpression('0 9-17 * * 1-5')).toBe(true);
    });

    it('should reject invalid cron expressions', () => {
      // Note: cron-parser is very lenient, so we test expressions that actually fail
      expect(validateCronExpression('* * * * * * *')).toBe(false); // Too many fields
      expect(validateCronExpression('invalid expression')).toBe(false);
      expect(validateCronExpression('60 * * * *')).toBe(false); // Invalid minute
      expect(validateCronExpression('* 25 * * *')).toBe(false); // Invalid hour
      expect(validateCronExpression('* * 32 * *')).toBe(false); // Invalid day
      expect(validateCronExpression('* * * 13 *')).toBe(false); // Invalid month
      expect(validateCronExpression('* * * * 8')).toBe(false); // Invalid day of week
    });
  });

  describe('parseCronExpression', () => {
    it('should parse valid cron expressions', () => {
      const result = parseCronExpression('0 9 * * *');
      expect(result.isValid).toBe(true);
      expect(result.humanReadable).toContain('9:00');
      expect(result.nextRuns).toHaveLength(5);
    });

    it('should handle invalid cron expressions', () => {
      const result = parseCronExpression('invalid');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.humanReadable).toBe('');
      expect(result.nextRuns).toHaveLength(0);
    });

    it('should generate human-readable descriptions', () => {
      const everyMinute = parseCronExpression('* * * * *');
      expect(everyMinute.humanReadable).toContain('Every minute');

      const everyHour = parseCronExpression('0 * * * *');
      expect(everyHour.humanReadable).toContain('Every hour');

      const daily = parseCronExpression('0 0 * * *');
      expect(daily.humanReadable).toContain('midnight');
    });
  });

  describe('getNextCronRun', () => {
    it('should return next execution time for valid expressions', () => {
      const nextRun = getNextCronRun('0 9 * * *');
      expect(nextRun).toBeInstanceOf(Date);
      expect(nextRun!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return null for invalid expressions', () => {
      const nextRun = getNextCronRun('invalid');
      expect(nextRun).toBeNull();
    });
  });

  describe('getNextCronRuns', () => {
    it('should return multiple execution times', () => {
      const runs = getNextCronRuns('0 9 * * *', 3);
      expect(runs).toHaveLength(3);
      expect(runs[0]).toBeInstanceOf(Date);
      expect(runs[1]).toBeInstanceOf(Date);
      expect(runs[2]).toBeInstanceOf(Date);
    });

    it('should return empty array for invalid expressions', () => {
      const runs = getNextCronRuns('invalid', 3);
      expect(runs).toHaveLength(0);
    });
  });

  describe('getCronStats', () => {
    it('should return stats for valid expressions', () => {
      const stats = getCronStats('0 9 * * *');
      expect(stats.isValid).toBe(true);
      expect(stats.nextRunCount).toBe(5);
      expect(stats.humanReadable).toBeDefined();
      expect(stats.error).toBeUndefined();
    });

    it('should return error stats for invalid expressions', () => {
      const stats = getCronStats('invalid');
      expect(stats.isValid).toBe(false);
      expect(stats.nextRunCount).toBe(0);
      expect(stats.humanReadable).toBe('');
      expect(stats.error).toBeDefined();
    });
  });

  describe('special cron expressions', () => {
    it('should handle every minute', () => {
      const result = parseCronExpression('* * * * *');
      expect(result.isValid).toBe(true);
      expect(result.humanReadable).toContain('Every minute');
    });

    it('should handle every hour', () => {
      const result = parseCronExpression('0 * * * *');
      expect(result.isValid).toBe(true);
      expect(result.humanReadable).toContain('Every hour');
    });

    it('should handle daily at midnight', () => {
      const result = parseCronExpression('0 0 * * *');
      expect(result.isValid).toBe(true);
      expect(result.humanReadable).toContain('midnight');
    });

    it('should handle weekly on Sunday', () => {
      const result = parseCronExpression('0 0 * * 0');
      expect(result.isValid).toBe(true);
      expect(result.humanReadable).toContain('Sunday');
    });

    it('should handle monthly on 1st', () => {
      const result = parseCronExpression('0 0 1 * *');
      expect(result.isValid).toBe(true);
      expect(result.humanReadable).toContain('1st');
    });

    it('should handle interval expressions', () => {
      const result = parseCronExpression('*/15 * * * *');
      expect(result.isValid).toBe(true);
      expect(result.humanReadable).toContain('15');
    });

    it('should handle range expressions', () => {
      const result = parseCronExpression('0 9-17 * * 1-5');
      expect(result.isValid).toBe(true);
      expect(result.humanReadable).toContain('9');
    });
  });
});
