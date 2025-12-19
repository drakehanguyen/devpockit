import { cn } from '@/libs/utils';
import * as React from 'react';

export interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
  width?: string;
}

export const QuantityInput = React.forwardRef<HTMLInputElement, QuantityInputProps>(
  ({ value, onChange, min = 1, max = 100, label = 'Quantity:', className, width = 'w-[140px]' }, ref) => {
    const [inputValue, setInputValue] = React.useState(value.toString());
    const isUserInputRef = React.useRef(false);

    // Only sync when external value changes (not from our updates)
    React.useEffect(() => {
      if (!isUserInputRef.current) {
        setInputValue(value.toString());
      }
      isUserInputRef.current = false;
    }, [value]);

    const handleChange = (newValue: string) => {
      setInputValue(newValue);

      // Allow empty string for deletion during typing
      if (newValue === '') {
        return;
      }

      // Only update parent if it's a valid number within range
      const parsed = parseInt(newValue, 10);
      if (!isNaN(parsed) && parsed >= min && parsed <= max) {
        isUserInputRef.current = true;
        onChange(parsed);
      }
    };

    const handleBlur = () => {
      let finalValue: number;

      // If empty on blur, set to minimum value
      if (inputValue === '' || inputValue.trim() === '') {
        finalValue = min;
      } else {
        const parsed = parseInt(inputValue, 10);

        // Clamp to valid range
        if (isNaN(parsed) || parsed < min) {
          finalValue = min;
        } else if (parsed > max) {
          finalValue = max;
        } else {
          finalValue = parsed;
        }
      }

      // Update both internal state and parent atomically
      isUserInputRef.current = true;
      setInputValue(finalValue.toString());
      onChange(finalValue);
    };

    return (
      <div
        className={cn(
          'inline-flex h-10 items-center rounded-lg border border-neutral-200 bg-background pl-3 pr-2 py-[9.5px] text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 dark:border-neutral-700',
          width,
          className
        )}
      >
        <div className="flex items-center gap-3 text-sm leading-[1.5] tracking-[0.07px] flex-1 min-w-0">
          <span className="text-neutral-500 whitespace-nowrap dark:text-neutral-400">{label}</span>
          <input
            ref={ref}
            type="number"
            min={min}
            max={max}
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className="font-mono bg-transparent text-neutral-900 dark:text-neutral-100 outline-none flex-1 min-w-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    );
  }
);

QuantityInput.displayName = 'QuantityInput';
