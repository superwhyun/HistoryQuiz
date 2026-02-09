import { useState } from 'react';
import type { Question, QuizConfig } from '../types';
import { QuestionCard } from './QuestionCard';
import { generateQuestionPDF, generateAnswerPDF, downloadPDF } from '../utils/pdf';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileDown, 
  RotateCcw, 
  CheckCircle,
  Grid3X3,
  X
} from 'lucide-react';

interface QuizPlayerProps {
  questions: Question[];
  config: QuizConfig;
  answers: Map<string, string>;
  currentIndex: number;
  onAnswer: (questionId: string, answer: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (index: number) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function QuizPlayer({
  questions,
  config,
  answers,
  currentIndex,
  onAnswer,
  onNext,
  onPrev,
  onGoTo,
  onSubmit,
  onReset,
}: QuizPlayerProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);

  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.size;
  const progress = (answeredCount / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;
  const allAnswered = answeredCount === questions.length;

  const handleDownloadQuestionPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const blob = await generateQuestionPDF(questions, config);
      downloadPDF(blob, `${config.title}_문제지.pdf`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadAnswerPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const blob = await generateAnswerPDF(questions, config);
      downloadPDF(blob, `${config.title}_답안지.pdf`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-lg text-gray-800 truncate">{config.title}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNavigator(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="문제 목록"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={onReset}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="처음으로"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 진행 상황 */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>진행률</span>
                <span>{answeredCount}/{questions.length}문제</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 네비게이션 버튼 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-2 bg-white rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5" />
            이전
          </button>
          <span className="text-gray-600 font-medium">
            {currentIndex + 1} / {questions.length}
          </span>
          <button
            onClick={onNext}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-1 px-4 py-2 bg-white rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            다음
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 문제 카드 */}
        <QuestionCard
          question={currentQuestion}
          index={currentIndex}
          userAnswer={answers.get(currentQuestion.id) || ''}
          onAnswer={(answer) => onAnswer(currentQuestion.id, answer)}
        />

        {/* 제출 버튼 - 마지막 문제에서만 표시 */}
        {isLastQuestion && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onSubmit}
              disabled={!allAnswered}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                allAnswered
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              {allAnswered ? '채점하기' : `채점하기 (${questions.length - answeredCount}문제 남음)`}
            </button>
          </div>
        )}

        {/* PDF 다운로드 버튼들 */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadQuestionPDF}
            disabled={isGeneratingPDF}
            className="flex-1 bg-white text-gray-700 border-2 border-gray-300 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            문제지 PDF
          </button>
          {config.includeAnswerSheet && (
            <button
              onClick={handleDownloadAnswerPDF}
              disabled={isGeneratingPDF}
              className="flex-1 bg-white text-gray-700 border-2 border-gray-300 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              답안지 PDF
            </button>
          )}
        </div>
      </main>

      {/* 문제 네비게이터 모달 */}
      {showNavigator && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg">문제 목록</h2>
              <button
                onClick={() => setShowNavigator(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, i) => {
                  const hasAnswer = answers.has(q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        onGoTo(i);
                        setShowNavigator(false);
                      }}
                      className={`aspect-square rounded-lg font-medium ${
                        i === currentIndex
                          ? 'bg-indigo-600 text-white'
                          : hasAnswer
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 rounded" />
                  <span>완료</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-indigo-600 rounded" />
                  <span>현재</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-100 rounded" />
                  <span>미완료</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
