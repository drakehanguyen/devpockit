'use client';

import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

// Define the structure for tool state
export interface ToolState {
  options: Record<string, any>;
  output: string;
  error: string;
  stats?: Record<string, any>;
  [key: string]: any;
}

// Define the context type
interface ToolStateContextType {
  toolStates: Record<string, ToolState>;
  updateToolState: (toolId: string, state: Partial<ToolState>) => void;
  getToolState: (toolId: string) => ToolState | undefined;
  clearToolState: (toolId: string) => void;
  clearAllToolStates: () => void;
  clearedTools: Set<string>;
}

// Create the context
const ToolStateContext = createContext<ToolStateContextType | undefined>(undefined);

// Provider component
interface ToolStateProviderProps {
  children: ReactNode;
}

export function ToolStateProvider({ children }: ToolStateProviderProps) {
  const [toolStates, setToolStates] = useState<Record<string, ToolState>>({});
  const [clearedTools, setClearedTools] = useState<Set<string>>(new Set());

  const updateToolState = useCallback((toolId: string, state: Partial<ToolState>) => {
    setToolStates(prev => {
      const currentState = prev[toolId] || {};
      const newState = { ...currentState, ...state };

      // Only update if the state actually changed
      if (JSON.stringify(currentState) !== JSON.stringify(newState)) {
        return {
          ...prev,
          [toolId]: newState
        };
      }
      return prev;
    });

    // Remove from cleared tools when state is updated
    setClearedTools(prev => {
      const newSet = new Set(prev);
      newSet.delete(toolId);
      return newSet;
    });
  }, []);

  const getToolState = useCallback((toolId: string): ToolState | undefined => {
    return toolStates[toolId];
  }, [toolStates]);

  const clearToolState = useCallback((toolId: string) => {
    setToolStates(prev => {
      const newStates = { ...prev };
      delete newStates[toolId];
      return newStates;
    });

    // Add to cleared tools
    setClearedTools(prev => new Set(prev).add(toolId));
  }, []);

  const clearAllToolStates = useCallback(() => {
    setToolStates({});
    // Mark all tools as cleared
    setClearedTools(new Set(Object.keys(toolStates)));
  }, [toolStates]);

  const value: ToolStateContextType = {
    toolStates,
    updateToolState,
    getToolState,
    clearToolState,
    clearAllToolStates,
    clearedTools
  };

  return (
    <ToolStateContext.Provider value={value}>
      {children}
    </ToolStateContext.Provider>
  );
}

// Custom hook to use the tool state context
export function useToolState(toolId: string) {
  const context = useContext(ToolStateContext);

  if (context === undefined) {
    throw new Error('useToolState must be used within a ToolStateProvider');
  }

  const { getToolState, updateToolState, clearToolState } = context;

  return {
    toolState: getToolState(toolId),
    updateToolState: (state: Partial<ToolState>) => updateToolState(toolId, state),
    clearToolState: () => clearToolState(toolId)
  };
}

// Hook to access the full context
export function useToolStateContext() {
  const context = useContext(ToolStateContext);

  if (context === undefined) {
    throw new Error('useToolStateContext must be used within a ToolStateProvider');
  }

  return context;
}
