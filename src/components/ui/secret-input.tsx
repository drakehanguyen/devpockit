'use client';

import { cn } from '@/libs/utils';
import { CheckCircleIcon, EyeIcon, EyeSlashIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export interface SecretInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  containerClassName?: string;
  verificationStatus?: {
    isValid: boolean;
    error?: string;
  } | null;
  isVerifying?: boolean;
  onSecretChange?: (value: string) => void;
}

export function SecretInput({
  label,
  value,
  onChange,
  placeholder,
  name,
  id,
  containerClassName,
  verificationStatus,
  isVerifying = false,
  onSecretChange
}: SecretInputProps) {
  const [showSecret, setShowSecret] = useState(false);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (onSecretChange) {
      onSecretChange(newValue);
    }
  };

  return (
    <div className={cn('flex-1 min-w-0', containerClassName)}>
      <div className="flex h-10 items-center rounded-lg border border-neutral-200 bg-background pl-3 pr-2 py-[9.5px] text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 dark:border-neutral-700 w-full">
        <div className="flex items-center gap-3 text-sm leading-normal tracking-[0.07px] flex-1 min-w-0">
          <span className="text-neutral-500 whitespace-nowrap dark:text-neutral-400">{label}</span>
          <input
            type={showSecret ? 'text' : 'password'}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            name={name}
            id={id}
            className="font-mono bg-transparent text-neutral-900 dark:text-neutral-100 outline-hidden flex-1 min-w-0 placeholder:text-muted-foreground"
          />
          {/* Verification Status */}
          {verificationStatus && !isVerifying && (
            <div className="flex items-center gap-1.5 shrink-0 pr-1">
              {verificationStatus.isValid ? (
                <>
                  <CheckCircleIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-600 dark:text-green-400 whitespace-nowrap">Valid</span>
                </>
              ) : (
                <>
                  <XCircleIcon className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  <span className="text-xs text-red-600 dark:text-red-400 whitespace-nowrap">Invalid</span>
                </>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0"
            aria-label={showSecret ? 'Hide secret' : 'Show secret'}
          >
            {showSecret ? (
              <EyeSlashIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            ) : (
              <EyeIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

