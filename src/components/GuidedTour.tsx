"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface TourStep {
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to AttestGraph!",
    content: "This tool helps you understand the security of container images by analyzing their attestations, provenance, and software bill of materials (SBOM).",
    position: "center"
  },
  {
    title: "Start with an Image Reference",
    content: "Enter a container image reference in the search box. You can use examples like 'cgr.dev/chainguard/static:latest' or try the example buttons.",
    target: "input[placeholder*='Enter image reference']",
    position: "bottom"
  },
  {
    title: "Choose Your Platform",
    content: "Select the target platform (linux/amd64 or linux/arm64) for multi-architecture images.",
    target: "select",
    position: "bottom"
  },
  {
    title: "Analyze Security",
    content: "Click 'Analyze' to fetch attestations and generate a security assessment. The tool will download SLSA provenance, SBOM data, and other attestations.",
    target: "button:contains('Analyze')",
    position: "left"
  },
  {
    title: "Understanding the Graph",
    content: "The graph shows relationships between your image, its attestations, and dependencies. Different shapes and colors represent different component types.",
    position: "center"
  },
  {
    title: "Interactive Legend",
    content: "The legend on the right explains what each component type means for your security. Hover over items for educational tooltips.",
    position: "center"
  },
  {
    title: "Click for Details",
    content: "Click any node in the graph to open a detailed panel with security information, educational context, and actionable recommendations.",
    position: "center"
  },
  {
    title: "Security Assessment",
    content: "Each component gets a security score and trust level. Look for the colored badges that indicate verification status and risk level.",
    position: "center"
  }
];

export default function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        
        {/* Tour Card */}
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {step.title}
                </h3>
                <div className="text-xs text-gray-500">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSkip}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%`
                }}
              />
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                {step.content}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Previous
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-500"
                >
                  Skip Tour
                </Button>
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="flex items-center gap-1"
                >
                  {isLastStep ? 'Get Started' : 'Next'}
                  {!isLastStep && <ChevronRight className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
