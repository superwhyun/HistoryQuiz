import { useState } from 'react';
import type { Question } from '../types';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  index: number;
  userAnswer: string;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
  isCorrect?: boolean;
}

export function QuestionCard({
  question,
  index,
  userAnswer,
  onAnswer,
  showResult,
  isCorrect,
}: QuestionCardProps) {
  const [inputValue, setInputValue] = useState(userAnswer || '');

  const handleInputChange = (value: string) => {
    setInputValue(value);
    onAnswer(value);
  };

  const getEraLabel = (era: string) => {
    const labels: Record<string, string> = {
      prehistoric: '선사',
      gojoseon: '고조선',
      early_states: '원삼국',
      three_kingdoms: '삼국',
      unified_silla: '남북국',
      goryeo: '고려',
      joseon_early: '조선전기',
      joseon_late: '조선후기',
      enlightenment: '개화기',
      japanese_colonial: '일제강점',
      modern: '현대',
    };
    return labels[era] || era;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return difficulty;
    }
  };

  const renderInput = () => {
    if (question.type === 'multiple_choice' && question.options) {
      return (
        <div className="space-y-2">
          {question.options.map((option, i) => {
            const optionLabel = `(${i + 1})`;
            const isSelected = userAnswer === optionLabel || userAnswer === option || userAnswer === String(i + 1);

            return (
              <button
                key={i}
                onClick={() => handleInputChange(optionLabel)}
                disabled={showResult}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="font-semibold text-indigo-600 mr-2">{optionLabel}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (question.type === 'ox') {
      return (
        <div className="flex gap-4">
          {['O', 'X'].map((value) => {
            const isSelected = userAnswer?.toUpperCase() === value;
            return (
              <button
                key={value}
                onClick={() => handleInputChange(value)}
                disabled={showResult}
                className={`flex-1 py-4 text-2xl font-bold rounded-lg border-2 transition-all ${
                  isSelected
                    ? value === 'O'
                      ? 'border-green-600 bg-green-50 text-green-600'
                      : 'border-red-600 bg-red-50 text-red-600'
                    : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {value === 'O' ? '○' : '×'}
              </button>
            );
          })}
        </div>
      );
    }

    // short_answer
    return (
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        disabled={showResult}
        placeholder="정답을 입력하세요"
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
      />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-indigo-600">{index + 1}번</span>
          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(question.difficulty)}`}>
            {getDifficultyLabel(question.difficulty)}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            {getEraLabel(question.era)}
          </span>
        </div>
        {showResult && (
          <div className="flex items-center gap-1">
            {isCorrect ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">정답</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-600">오답</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* 문제 내용 */}
      <div className="p-4">
        <p className="text-lg mb-4 leading-relaxed">{question.content}</p>
        {renderInput()}
      </div>

      {/* 결과 표시 (채점 후) */}
      {showResult && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">
                정답: <span className="text-indigo-600">{question.answer}</span>
              </p>
              <p className="text-gray-700 mt-1 text-sm leading-relaxed">
                {question.explanation}
              </p>
              {question.source && (
                <p className="text-xs text-gray-500 mt-2">
                  출처: {question.source}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
