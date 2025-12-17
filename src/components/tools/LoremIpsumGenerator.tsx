'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { EditorPanel, type EditorPanelTab } from '@/components/ui/EditorPanel';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_OPTIONS, LOREM_OPTIONS } from '@/config/lorem-ipsum-config';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import { generateLoremIpsum, validateLoremOptions, type LoremOptions } from '@/libs/lorem-ipsum';
import { cn } from '@/libs/utils';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';

interface LoremIpsumGeneratorProps {
  className?: string;
}

export function LoremIpsumGenerator({ className }: LoremIpsumGeneratorProps) {
  const { toolState, updateToolState } = useToolState('lorem-ipsum');

  // Initialize with defaults to avoid hydration mismatch
  const [options, setOptions] = useState<LoremOptions>(DEFAULT_OPTIONS);
  const [outputPlain, setOutputPlain] = useState<string>('');
  const [outputHtml, setOutputHtml] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'plain' | 'html'>('plain');
  const [isHydrated, setIsHydrated] = useState(false);

  // Editor settings
  const [theme] = useCodeEditorTheme('basicDark');
  const [wrapText, setWrapText] = useState(true);

  // Hydrate state from toolState after mount (client-side only)
  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.options) setOptions(toolState.options as LoremOptions);
      if (toolState.outputPlain) setOutputPlain(toolState.outputPlain as string);
      if (toolState.outputHtml) setOutputHtml(toolState.outputHtml as string);
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
        outputPlain,
        outputHtml,
        error
      });
    }
  }, [options, outputPlain, outputHtml, error, isHydrated]);

  // Reset local state when tool state is cleared
  useEffect(() => {
    if (isHydrated && (!toolState || Object.keys(toolState).length === 0)) {
      setOptions(DEFAULT_OPTIONS);
      setOutputPlain('');
      setOutputHtml('');
      setError('');
      setActiveTab('plain');
    }
  }, [toolState, isHydrated]);

  // Sync format with active tab
  useEffect(() => {
    setOptions(prev => ({ ...prev, format: activeTab }));
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'plain' | 'html');
  };

  const convertPlainToHtml = (plainText: string, unit: 'words' | 'sentences' | 'paragraphs'): string => {
    if (!plainText) return '';

    switch (unit) {
      case 'words':
      case 'sentences':
        // Wrap entire content in a single <p> tag
        return `<p>${plainText}</p>`;

      case 'paragraphs':
        // Split by double newlines and wrap each paragraph in <p> tags
        const paragraphs = plainText.split('\n\n').filter(p => p.trim().length > 0);
        return paragraphs.map(p => `<p>${p.trim()}</p>`).join('\n');

      default:
        return plainText;
    }
  };

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

      // Generate plain text once (same content)
      const plainOptions = { ...options, format: 'plain' as const };
      const plainResult = generateLoremIpsum(plainOptions);

      // Convert the same plain text to HTML format
      const htmlResult = convertPlainToHtml(plainResult, options.unit);

      setOutputPlain(plainResult);
      setOutputHtml(htmlResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate text');
      setOutputPlain('');
      setOutputHtml('');
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

  // Prepare tabs for EditorPanel
  const outputTabs: EditorPanelTab[] = useMemo(
    () => [
      {
        id: 'plain',
        label: 'Plain text',
        content: outputPlain,
        language: 'plaintext',
      },
      {
        id: 'html',
        label: 'HTML',
        content: outputHtml,
        language: 'xml',
      },
    ],
    [outputPlain, outputHtml]
  );


  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header Section */}
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="text-[32px] font-normal leading-6 tracking-normal text-neutral-900 dark:text-neutral-100 mb-3">
          Lorem Ipsum Generator
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Generate placeholder text in Latin or Bacon Ipsum format
        </p>
      </div>

      {/* Body Section */}
      <div className="flex-1 bg-background px-[24px] pt-6 pb-10">
        <div className="flex flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-col gap-4">
            {/* Main Controls Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Type Select */}
              <Select
                value={options.type}
                onValueChange={(value: 'latin' | 'bacon' | 'gen-alpha' | 'tech-bro' | 'wibu' | 'climber-bro') =>
                  setOptions(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger label="Ipsum Type:">
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

              {/* Unit Select */}
              <Select
                value={options.unit}
                onValueChange={(value: 'words' | 'sentences' | 'paragraphs') =>
                  setOptions(prev => ({ ...prev, unit: value }))
                }
              >
                <SelectTrigger label="Unit:">
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

              {/* Quantity Input */}
              <Input
                type="number"
                min="1"
                max="100"
                value={options.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-[84px] text-center"
              />

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                variant="default"
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
          </div>

          {/* Results */}
          {error ? (
            <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          ) : (
            <EditorPanel
              tabs={outputTabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              showStats={true}
              height="374px"
              theme={theme}
              wrapText={wrapText}
              onWrapTextChange={setWrapText}
              showWrapTextToggle={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
