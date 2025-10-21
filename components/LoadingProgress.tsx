'use client';

import { useEffect, useState } from 'react';

interface LoadingProgressProps {
  steps?: string[];
  estimatedTime?: number; // in seconds
}

export default function LoadingProgress({ 
  steps = [
    'Uploading image...',
    'Analyzing label with AI...',
    'Extracting text from label...',
    'Verifying information...',
    'Generating report...'
  ],
  estimatedTime = 15
}: LoadingProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // Cap at 95% until actually complete
        return prev + (100 / (estimatedTime * 10)); // Increment smoothly
      });
    }, 100);

    // Step progression
    const stepDuration = (estimatedTime * 1000) / steps.length;
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, stepDuration);

    // Time remaining countdown
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(timerInterval);
    };
  }, [steps.length, estimatedTime]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="relative">
          <svg className="animate-spin h-16 w-16 text-primary" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
              fill="none" 
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
            />
          </svg>
          {/* Progress percentage in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Main heading */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Processing Your Label...
          </h3>
          <p className="text-sm text-gray-600">
            Please wait while we verify your label
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="w-full max-w-md space-y-3">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-center gap-3 transition-all duration-300 ${
                index === currentStep 
                  ? 'opacity-100 scale-100' 
                  : index < currentStep 
                  ? 'opacity-60' 
                  : 'opacity-30'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {index < currentStep ? (
                  // Completed
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : index === currentStep ? (
                  // In progress
                  <div className="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  </div>
                ) : (
                  // Pending
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                )}
              </div>

              {/* Text */}
              <span className={`text-sm ${
                index === currentStep 
                  ? 'text-gray-900 font-medium' 
                  : 'text-gray-600'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Time remaining */}
        {timeRemaining > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            Estimated time remaining: {timeRemaining} second{timeRemaining !== 1 ? 's' : ''}
          </div>
        )}

        {/* Tip */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 max-w-md">
          <p className="text-xs text-blue-900">
            💡 <strong>Tip:</strong> For best results, ensure your label image is clear and well-lit.
            The AI is analyzing text, checking compliance, and comparing against your form data.
          </p>
        </div>
      </div>
    </div>
  );
}

