export interface CronParserOptions {
  expression: string;
  showNextRuns: boolean;
  nextRunCount: number;
  timezone?: string;
}

export const DEFAULT_CRON_OPTIONS: CronParserOptions = {
  expression: '',
  showNextRuns: true,
  nextRunCount: 5,
  timezone: 'UTC'
};

export const CRON_EXAMPLES = [
  {
    name: 'Every Minute',
    expression: '* * * * *',
    description: 'Runs every minute',
    category: 'Common'
  },
  {
    name: 'Every Hour',
    expression: '0 * * * *',
    description: 'Runs at the top of every hour',
    category: 'Common'
  },
  {
    name: 'Every Day at Midnight',
    expression: '0 0 * * *',
    description: 'Runs every day at midnight',
    category: 'Daily'
  },
  {
    name: 'Every Day at 9 AM',
    expression: '0 9 * * *',
    description: 'Runs every day at 9:00 AM',
    category: 'Daily'
  },
  {
    name: 'Every Monday at 9 AM',
    expression: '0 9 * * 1',
    description: 'Runs every Monday at 9:00 AM',
    category: 'Weekly'
  },
  {
    name: 'Every Sunday at Midnight',
    expression: '0 0 * * 0',
    description: 'Runs every Sunday at midnight',
    category: 'Weekly'
  },
  {
    name: 'First Day of Month',
    expression: '0 0 1 * *',
    description: 'Runs on the 1st of every month at midnight',
    category: 'Monthly'
  },
  {
    name: 'Every 15 Minutes',
    expression: '*/15 * * * *',
    description: 'Runs every 15 minutes',
    category: 'Interval'
  },
  {
    name: 'Every 2 Hours',
    expression: '0 */2 * * *',
    description: 'Runs every 2 hours',
    category: 'Interval'
  },
  {
    name: 'Weekdays at 6 PM',
    expression: '0 18 * * 1-5',
    description: 'Runs Monday to Friday at 6:00 PM',
    category: 'Business'
  },
  {
    name: 'Backup at 2 AM',
    expression: '0 2 * * *',
    description: 'Runs daily backup at 2:00 AM',
    category: 'Maintenance'
  },
  {
    name: 'Quarterly Report',
    expression: '0 9 1 1,4,7,10 *',
    description: 'Runs quarterly on the 1st of Jan, Apr, Jul, Oct at 9 AM',
    category: 'Reports'
  }
];

export const CRON_CATEGORIES = [
  { name: 'Common', description: 'Frequently used expressions', icon: '⭐' },
  { name: 'Daily', description: 'Daily schedules', icon: '📅' },
  { name: 'Weekly', description: 'Weekly schedules', icon: '📆' },
  { name: 'Monthly', description: 'Monthly schedules', icon: '🗓️' },
  { name: 'Interval', description: 'Interval-based schedules', icon: '⏰' },
  { name: 'Business', description: 'Business hours schedules', icon: '💼' },
  { name: 'Maintenance', description: 'System maintenance schedules', icon: '🔧' },
  { name: 'Reports', description: 'Report generation schedules', icon: '📊' }
];

export const CRON_VALIDATION_RULES = [
  {
    field: 'minute',
    range: '0-59',
    description: 'Minute field (0-59)',
    examples: ['0', '30', '*/15', '0,30']
  },
  {
    field: 'hour',
    range: '0-23',
    description: 'Hour field (0-23)',
    examples: ['0', '12', '*/2', '9-17']
  },
  {
    field: 'day',
    range: '1-31',
    description: 'Day of month (1-31)',
    examples: ['1', '15', '*/5', '1,15,30']
  },
  {
    field: 'month',
    range: '1-12',
    description: 'Month field (1-12)',
    examples: ['1', '6', '*/3', '1,6,12']
  },
  {
    field: 'weekday',
    range: '0-6',
    description: 'Day of week (0=Sunday, 6=Saturday)',
    examples: ['0', '1', '1-5', '0,6']
  }
];

export const CRON_SPECIAL_CHARACTERS = [
  {
    character: '*',
    name: 'Asterisk',
    description: 'Matches any value',
    example: '* * * * * (every minute)'
  },
  {
    character: ',',
    name: 'Comma',
    description: 'List of values',
    example: '0,30 * * * * (at 0 and 30 minutes)'
  },
  {
    character: '-',
    name: 'Hyphen',
    description: 'Range of values',
    example: '0 9-17 * * * (9 AM to 5 PM)'
  },
  {
    character: '/',
    name: 'Slash',
    description: 'Step values',
    example: '*/15 * * * * (every 15 minutes)'
  },
  {
    character: '?',
    name: 'Question Mark',
    description: 'No specific value (day or weekday)',
    example: '0 9 ? * 1 (Mondays at 9 AM)'
  }
];

export const CRON_TOOL_DESCRIPTIONS = {
  title: 'Cron Expression Parser',
  description: 'Parse and validate cron expressions with human-readable descriptions and next execution times.',
  features: [
    'Parse any valid cron expression',
    'Generate human-readable descriptions',
    'Calculate next execution times',
    'Validate expression format',
    'Support all standard cron syntax'
  ],
  useCases: [
    'Scheduling automated tasks',
    'Setting up job queues',
    'Planning maintenance windows',
    'Creating backup schedules',
    'Configuring monitoring alerts'
  ]
};

export const CRON_EXAMPLE_SETS = {
  beginner: [
    { name: 'Every Minute', expression: '* * * * *' },
    { name: 'Every Hour', expression: '0 * * * *' },
    { name: 'Daily at Midnight', expression: '0 0 * * *' }
  ],
  intermediate: [
    { name: 'Every 15 Minutes', expression: '*/15 * * * *' },
    { name: 'Business Hours', expression: '0 9-17 * * 1-5' },
    { name: 'Weekend Backup', expression: '0 2 * * 0,6' }
  ],
  advanced: [
    { name: 'Complex Interval', expression: '0 0 */3 * *' },
    { name: 'Multiple Times', expression: '0 9,12,15 * * 1-5' },
    { name: 'Quarterly', expression: '0 9 1 1,4,7,10 *' }
  ]
};

export const CRON_FORMAT_HELP = {
  format: 'minute hour day month weekday',
  description: 'Five fields separated by spaces',
  examples: [
    { expression: '0 9 * * *', description: 'Every day at 9:00 AM' },
    { expression: '30 14 * * 1', description: 'Every Monday at 2:30 PM' },
    { expression: '0 0 1 * *', description: 'First day of every month at midnight' },
    { expression: '*/15 * * * *', description: 'Every 15 minutes' },
    { expression: '0 9-17 * * 1-5', description: 'Every hour from 9 AM to 5 PM, Monday to Friday' }
  ]
};
