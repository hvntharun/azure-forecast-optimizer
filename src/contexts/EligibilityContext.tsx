import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClassificationCategory } from '@/lib/classificationData';

interface EligibilityState {
  eligibilityChecked: boolean;
  selectedCategory: ClassificationCategory;
  lastAnalysisTime: number | null;
  isLoading: boolean;
  currentStep: number;
}

interface EligibilityContextType {
  state: EligibilityState;
  setEligibilityChecked: (checked: boolean) => void;
  setSelectedCategory: (category: ClassificationCategory) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentStep: (step: number) => void;
  resetEligibilityState: () => void;
  shouldShowResults: () => boolean;
}

const defaultState: EligibilityState = {
  eligibilityChecked: false,
  selectedCategory: 'Analytics',
  lastAnalysisTime: null,
  isLoading: false,
  currentStep: 0,
};

const EligibilityContext = createContext<EligibilityContextType | undefined>(undefined);

// Custom hook to use the eligibility context
export const useEligibility = () => {
  const context = useContext(EligibilityContext);
  if (context === undefined) {
    throw new Error('useEligibility must be used within an EligibilityProvider');
  }
  return context;
};

interface EligibilityProviderProps {
  children: ReactNode;
}

export const EligibilityProvider: React.FC<EligibilityProviderProps> = ({ children }) => {
  const [state, setState] = useState<EligibilityState>(() => {
    // Try to restore state from sessionStorage on initialization
    const savedState = sessionStorage.getItem('eligibilityState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Check if the analysis is still valid (within last 30 minutes)
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        if (parsed.lastAnalysisTime && (now - parsed.lastAnalysisTime) < thirtyMinutes) {
          return { ...defaultState, ...parsed };
        }
      } catch (error) {
        console.warn('Failed to parse saved eligibility state:', error);
      }
    }
    return defaultState;
  });

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('eligibilityState', JSON.stringify(state));
  }, [state]);

  const setEligibilityChecked = (checked: boolean) => {
    setState(prev => ({
      ...prev,
      eligibilityChecked: checked,
      lastAnalysisTime: checked ? Date.now() : prev.lastAnalysisTime,
    }));
  };

  const setSelectedCategory = (category: ClassificationCategory) => {
    setState(prev => ({
      ...prev,
      selectedCategory: category,
      // Reset eligibility when category changes
      eligibilityChecked: false,
      lastAnalysisTime: null,
    }));
  };

  const setIsLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setCurrentStep = (step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const resetEligibilityState = () => {
    setState(defaultState);
    sessionStorage.removeItem('eligibilityState');
  };

  const shouldShowResults = () => {
    if (!state.eligibilityChecked || !state.lastAnalysisTime) return false;
    
    // Check if analysis is still valid (within last 30 minutes)
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    return (now - state.lastAnalysisTime) < thirtyMinutes;
  };

  const value: EligibilityContextType = {
    state,
    setEligibilityChecked,
    setSelectedCategory,
    setIsLoading,
    setCurrentStep,
    resetEligibilityState,
    shouldShowResults,
  };

  return (
    <EligibilityContext.Provider value={value}>
      {children}
    </EligibilityContext.Provider>
  );
};