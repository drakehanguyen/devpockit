'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/ui/CodeEditor';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DEFAULT_OPTIONS, LOREM_OPTIONS } from '@/config/lorem-ipsum-config';
import { generateLoremIpsum, validateLoremOptions, type LoremOptions } from '@/libs/lorem-ipsum';
import { cn } from '@/libs/utils';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface LoremIpsumGeneratorProps {
  className?: string;
}

export function LoremIpsumGenerator({ className }: LoremIpsumGeneratorProps) {
  const { toolState, updateToolState } = useToolState('lorem-ipsum-generator');

  // Initialize with defaults to avoid hydration mismatch
  const [options, setOptions] = useState<LoremOptions>(DEFAULT_OPTIONS);
  const [outputPlain, setOutputPlain] = useState<string>('');
  const [outputHtml, setOutputHtml] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'plain' | 'html'>('plain');
  const [isHydrated, setIsHydrated] = useState(false);

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


  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header Section */}
      <div className="bg-primary-foreground px-[24px] py-[24px]">
        <div className="max-w-[1200px]">
          <h1 className="text-[32px] font-semibold leading-6 tracking-[-0.64px] text-foreground mb-3">
            Lorem Ipsum Generator
          </h1>
          <p className="text-sm leading-5 tracking-[-0.28px] text-muted-foreground">
            Generate placeholder text in Latin or Bacon Ipsum format
          </p>
        </div>
      </div>

      {/* Body Section */}
      <div className="flex-1 bg-background px-[24px] pt-6 pb-10">
        <div className="flex flex-col gap-4">
          {/* Controls */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
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
          <div className="border border-border rounded-[10px] p-3 bg-background">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="inline-flex mb-4">
                <TabsTrigger value="plain">
                  Plain text
                </TabsTrigger>
                <TabsTrigger value="html">
                  HTML
                </TabsTrigger>
              </TabsList>

              <TabsContent value="plain" className="mt-0">
                <CodeEditor
                  mode="output"
                  outputValue={outputPlain}
                  language="plaintext"
                  placeholder="Click 'Generate' to create your Lorem Ipsum content"
                  error={error}
                  isLoading={isGenerating}
                  showStats={true}
                  height="374px"
                  className="border-0 p-0"
                />
              </TabsContent>

              <TabsContent value="html" className="mt-0">
                <CodeEditor
                  mode="output"
                  outputValue={outputHtml}
                  language="xml"
                  placeholder="Click 'Generate' to create your Lorem Ipsum content"
                  error={error}
                  isLoading={isGenerating}
                  showStats={true}
                  height="374px"
                  className="border-0 p-0"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
