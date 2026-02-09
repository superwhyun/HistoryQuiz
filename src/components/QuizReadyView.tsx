import { useState } from 'react';
import type { Question, QuizConfig } from '../types';
import { generateQuestionPDF, generateAnswerPDF, downloadPDF } from '../utils/pdf';
import { FileDown, Play, BookOpen, RotateCcw } from 'lucide-react';

interface QuizReadyViewProps {
  questions: Question[];
  config: QuizConfig;
  onStartQuiz: () => void;
  onReset: () => void;
}

export function QuizReadyView({
  questions,
  config,
  onStartQuiz,
  onReset,
}: QuizReadyViewProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-center">
          <BookOpen className="w-12 h-12 text-white mx-auto mb-3" />
          <h1 className="text-xl font-bold text-white">{config.title}</h1>
          <p className="text-indigo-100 text-sm mt-2">
            총 {questions.length}문제가 생성되었습니다
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="p-6 space-y-4">
          {/* 문제 풀기 버튼 (가장 큼) */}
          <button
            onClick={onStartQuiz}
            className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6" />
            문제 풀기
          </button>

          {/* 다운로드 버튼들 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadQuestionPDF}
              disabled={isGeneratingPDF}
              className="bg-white text-gray-700 border-2 border-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FileDown className="w-5 h-5" />
              문제집 다운로드
            </button>
            {config.includeAnswerSheet && (
              <button
                onClick={handleDownloadAnswerPDF}
                disabled={isGeneratingPDF}
                className="bg-white text-gray-700 border-2 border-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FileDown className="w-5 h-5" />
                답안지 다운로드
              </button>
            )}
          </div>

          {/* 처음으로 버튼 */}
          <button
            onClick={onReset}
            className="w-full text-gray-500 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            다른 문제집 만들기
          </button>
        </div>

        {/* 정보 */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="mb-2">
              <strong>문제 풀기</strong>를 누르면 웹에서 바로 문제를 풀 수 있습니다.
            </p>
            <p>
              PDF를 다운로드해서 인쇄하거나 저장할 수도 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
