import React, { useState } from 'react';
import { Question } from '../types';
import { CheckCircle, XCircle, ArrowRight, HelpCircle } from 'lucide-react';

interface QuizInterfaceProps {
  questions: Question[];
  onComplete: (score: number, total: number) => void;
  onExit: () => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({ questions, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Add logic for last question score update if needed, but score is updated on submit
      onComplete(score, questions.length);
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header / Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <button onClick={onExit} className="text-red-500 hover:text-red-600">Quit Test</button>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div 
            className="h-full bg-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 sm:p-8">
        <h2 className="mb-6 text-xl font-bold leading-relaxed text-slate-800 sm:text-2xl">
          {currentQuestion.questionText}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let borderClass = "border-slate-200 hover:border-primary-400";
            let bgClass = "bg-white hover:bg-slate-50";
            let icon = null;

            if (isAnswered) {
              if (idx === currentQuestion.correctAnswerIndex) {
                borderClass = "border-green-500 ring-1 ring-green-500";
                bgClass = "bg-green-50";
                icon = <CheckCircle className="h-5 w-5 text-green-600" />;
              } else if (idx === selectedOption) {
                borderClass = "border-red-500 ring-1 ring-red-500";
                bgClass = "bg-red-50";
                icon = <XCircle className="h-5 w-5 text-red-600" />;
              } else {
                 bgClass = "bg-slate-50 opacity-50";
              }
            } else if (selectedOption === idx) {
              borderClass = "border-primary-600 ring-1 ring-primary-600";
              bgClass = "bg-primary-50";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={isAnswered}
                className={`group flex w-full items-center justify-between rounded-xl border-2 px-4 py-4 text-left font-medium transition-all ${borderClass} ${bgClass}`}
              >
                <span className="text-slate-700">{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Explanation Area */}
        {isAnswered && (
          <div className="mt-6 animate-fade-in rounded-lg bg-indigo-50 p-4 text-sm text-indigo-900">
            <div className="flex items-center gap-2 font-bold mb-1">
              <HelpCircle className="h-4 w-4" /> Explanation:
            </div>
            {currentQuestion.explanation}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-end">
        {!isAnswered ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
            className="rounded-xl bg-primary-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
          >
            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};