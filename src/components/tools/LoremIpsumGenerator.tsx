'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_OPTIONS, LOREM_OPTIONS } from '@/config/lorem-ipsum-config';
import { generateLoremIpsum, validateLoremOptions, type LoremOptions } from '@/libs/lorem-ipsum';
import { cn } from '@/libs/utils';
import { ArrowPathIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface LoremIpsumGeneratorProps {
  className?: string;
}

export function LoremIpsumGenerator({ className }: LoremIpsumGeneratorProps) {
  const { toolState, updateToolState } = useToolState('lorem-ipsum-generator');

  // Initialize with defaults to avoid hydration mismatch
  const [options, setOptions] = useState<LoremOptions>(DEFAULT_OPTIONS);
  const [output, setOutput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'plain' | 'html'>('plain');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate state from toolState after mount (client-side only)
  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.options) setOptions(toolState.options as LoremOptions);
      if (toolState.output) setOutput(toolState.output as string);
      if (toolState.error) setError(toolState.error as string);
      if ((toolState.options as LoremOptions)?.format) {
        setActiveTab((toolState.options as LoremOptions).format);
      }
    }
  }, []);

  // Update persistent state whenever local state changes
  useEffect(() => {
    if (isHydrated) {
      updateToolState({
        options,
        output,
        error
      });
    }
  }, [options, output, error, isHydrated]);

  // Reset local state when tool state is cleared
  useEffect(() => {
    if (isHydrated && (!toolState || Object.keys(toolState).length === 0)) {
      setOptions(DEFAULT_OPTIONS);
      setOutput('');
      setError('');
      setActiveTab('plain');
    }
  }, [toolState, isHydrated]);

  // Sync format with active tab
  useEffect(() => {
    setOptions(prev => ({ ...prev, format: activeTab }));
  }, [activeTab]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      // Validate options before generation
      const validationErrors = validateLoremOptions(options);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }

      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = generateLoremIpsum(options);
      setOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate text');
      setOutput('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuantityChange = (value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity >= 1 && quantity <= 100) {
      setOptions(prev => ({ ...prev, quantity }));
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const characterCount = output.length;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header Section */}
      <div className="bg-muted px-12 py-10">
        <div className="max-w-[1200px]">
          <h1 className="text-[32px] font-semibold leading-6 tracking-[-0.64px] text-foreground mb-4">
            Lorem Ipsum Generator
          </h1>
          <p className="text-sm leading-5 tracking-[-0.28px] text-muted-foreground">
            Generate placeholder text in Latin or Bacon Ipsum format
          </p>
        </div>
      </div>

      {/* Body Section */}
      <div className="flex-1 bg-background px-12 py-10">
        <div className="flex flex-col gap-6">
          {/* Controls */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Type Select */}
              <Select
                value={options.type}
                onValueChange={(value: 'latin' | 'bacon' | 'gen-alpha' | 'tech-bro' | 'wibu' | 'climber-bro') =>
                  setOptions(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="w-[228px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOREM_OPTIONS.types.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quantity Input */}
              <Input
                type="number"
                min="1"
                max="100"
                value={options.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-[84px] text-center"
              />

              {/* Unit Select */}
              <Select
                value={options.unit}
                onValueChange={(value: 'words' | 'sentences' | 'paragraphs') =>
                  setOptions(prev => ({ ...prev, unit: value }))
                }
              >
                <SelectTrigger className="w-[155px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOREM_OPTIONS.units.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                size="default"
              >
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
            </div>

            {/* Copy Button */}
            <Button
              onClick={handleCopy}
              disabled={!output}
              variant="secondary"
              size="default"
            >
              {copySuccess ? 'Copied!' : 'Copy'}
              <DocumentDuplicateIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Results */}
          <div className="border border-border rounded-[10px] p-3 bg-background">
            {/* Tabs */}
            <div className="bg-muted rounded-[10px] p-[3px] inline-flex mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('plain')}
                className={cn(
                  'rounded-[10px] h-[29px]',
                  activeTab === 'plain' && 'bg-background shadow-sm'
                )}
              >
                Plain text
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('html')}
                className={cn(
                  'rounded-[10px] h-[29px]',
                  activeTab === 'html' && 'bg-background shadow-sm'
                )}
              >
                HTML
              </Button>
            </div>

            {/* Textarea */}
            <textarea
              readOnly
              value={output || (error ? '' : '')}
              placeholder={error || 'Click "Generate" to create your Lorem Ipsum content'}
              className={cn(
                'w-full h-[374px] p-2 bg-background rounded-lg resize-none',
                'font-mono text-base leading-[1.5] text-foreground',
                'focus:outline-none',
                error ? 'text-red-500 placeholder:text-red-500' : 'placeholder:text-muted-foreground'
              )}
            />

            {/* Character Count */}
            {output && !error && (
              <p className="text-sm tracking-[0.07px] text-muted-foreground mt-4">
                {characterCount} characters
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
