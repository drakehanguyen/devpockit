'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OutputDisplay } from '@/components/ui/OutputDisplay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_OPTIONS, LOREM_OPTIONS } from '@/config/lorem-ipsum-config';
import { generateLoremIpsum, validateLoremOptions, type LoremOptions } from '@/lib/lorem-ipsum';
import { cn } from '@/lib/utils';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface LoremIpsumGeneratorProps {
  className?: string;
}


export function LoremIpsumGenerator({ className }: LoremIpsumGeneratorProps) {
  const { toolState, updateToolState } = useToolState('lorem-ipsum-generator');

  // Initialize with persistent state or defaults
  const [options, setOptions] = useState<LoremOptions>(
    (toolState?.options as LoremOptions) || DEFAULT_OPTIONS
  );
  const [output, setOutput] = useState<string>(toolState?.output || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>(toolState?.error || '');

  // Update persistent state whenever local state changes
  useEffect(() => {
    updateToolState({
      options,
      output,
      error
    });
  }, [options, output, error]);

  // Reset local state when tool state is cleared
  useEffect(() => {
    if (!toolState || Object.keys(toolState).length === 0) {
      setOptions(DEFAULT_OPTIONS);
      setOutput('');
      setError('');
    }
  }, [toolState]);


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
    if (quantity >= 1 && quantity <= 100) {
      setOptions(prev => ({ ...prev, quantity }));
    }
  };

  const incrementQuantity = () => {
    if (options.quantity < 100) {
      setOptions(prev => ({ ...prev, quantity: prev.quantity + 1 }));
    }
  };

  const decrementQuantity = () => {
    if (options.quantity > 1) {
      setOptions(prev => ({ ...prev, quantity: prev.quantity - 1 }));
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Lorem Ipsum Generator</CardTitle>
          <CardDescription>
            Generate placeholder text in Latin or Bacon Ipsum format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="type">Ipsum Type</Label>
              <Select
                value={options.type}
                onValueChange={(value: 'latin' | 'bacon') =>
                  setOptions(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
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
            </div>

            {/* Unit Selection */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={options.unit}
                onValueChange={(value: 'words' | 'sentences' | 'paragraphs') =>
                  setOptions(prev => ({ ...prev, unit: value }))
                }
              >
                <SelectTrigger>
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
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <Label htmlFor="format">Output Format</Label>
              <Select
                value={options.format}
                onValueChange={(value: 'plain' | 'html') =>
                  setOptions(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOREM_OPTIONS.formats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (1-100)</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decrementQuantity}
                  disabled={options.quantity <= 1}
                  className="h-10 w-10 p-0"
                >
                  -
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="100"
                  value={options.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={incrementQuantity}
                  disabled={options.quantity >= 100}
                  className="h-10 w-10 p-0"
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
              className="min-w-32"
            >
              {isGenerating ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Text'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Output Display */}
      <OutputDisplay
        title="Generated Text"
        content={output}
        error={error}
        isLoading={isGenerating}
        format={options.format}
        placeholder="Click 'Generate Text' to create your Lorem Ipsum content"
        showWordCount={options.unit === 'words'}
        showCharacterCount={true}
      />
    </div>
  );
}
