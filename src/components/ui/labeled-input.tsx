import * as React from 'react';
import { cn } from '@/libs/utils';

export interface LabeledInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  containerClassName?: string;
  inputClassName?: string;
}

export const LabeledInput = React.forwardRef<HTMLInputElement, LabeledInputProps>(
  ({ label, value, onChange, placeholder, containerClassName, inputClassName, className, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex h-10 items-center rounded-lg border border-neutral-200 bg-background pl-3 pr-2 py-[9.5px] text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 dark:border-neutral-700',
          containerClassName || 'w-full'
        )}
      >
        <div className="flex items-center gap-3 text-sm leading-[1.5] tracking-[0.07px] flex-1 min-w-0">
          <span className="text-neutral-500 whitespace-nowrap dark:text-neutral-400">{label}</span>
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'font-mono bg-transparent text-neutral-900 dark:text-neutral-100 outline-none flex-1 min-w-0 placeholder:text-muted-foreground',
              inputClassName,
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);

LabeledInput.displayName = 'LabeledInput';

