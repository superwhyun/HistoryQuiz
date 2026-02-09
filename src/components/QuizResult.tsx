import type { Question, QuizResult, QuizConfig } from '../types';
import { QuestionCard } from './QuestionCard';
import { generateQuestionPDF, generateAnswerPDF, downloadPDF } from '../utils/pdf';
import { RotateCcw, FileDown, Home, Trophy, Target, XCircle, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface QuizResultProps {
  questions: Question[];
  result: QuizResult;
  config: QuizConfig;
  onReset: () => void;
  onRestart: () => void;
}

export function QuizResultView({
  questions,
  result,
  config,
  onReset,
  onRestart,
}: QuizResultProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

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

  const getGrade = (score: number) => {
    if (score >= 90) return { text: '수', color: 'text-indigo-600', bg: 'bg-indigo-50' };
    if (score >= 80) return { text: '우', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 70) return { text: '미', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 60) return { text: '양', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: '가', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const grade = getGrade(result.score);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 상단 결과 요약 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">시험 결과</h1>
          
          {/* 점수 원형 표시 */}
          <div className="flex justify-center mb-6">
            <div className={`w-32 h-32 rounded-full ${grade.bg} flex items-center justify-center`}>
              <div className="text-center">
                <div className={`text-4xl font-bold ${grade.color}`}>{result.score}</div>
                <div className="text-sm text-gray-600">점</div>
              </div>
            </div>
          </div>

          {/* 등급 */}
          <div className="text-center mb-6">
            <span className="text-3xl font-bold">{grade.text}</span>
            <span className="text-lg opacity-80"> 등급</span>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-sm opacity-80">정답</span>
              </div>
              <div className="text-xl font-bold">{result.correct}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="w-4 h-4" />
                <span className="text-sm opacity-80">오답</span>
              </div>
              <div className="text-xl font-bold">{result.wrong}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm opacity-80">미답</span>
              </div>
              <div className="text-xl font-bold">{result.unanswered}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 및 상세 결과 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 액션 버튼들 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            다시 풀기
          </button>
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            처음으로
          </button>
          <button
            onClick={handleDownloadQuestionPDF}
            disabled={isGeneratingPDF}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            문제지 PDF
          </button>
          <button
            onClick={handleDownloadAnswerPDF}
            disabled={isGeneratingPDF}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            답안지 PDF
          </button>
        </div>

        {/* 상세 결과 토글 */}
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="w-full bg-white py-3 px-4 rounded-lg shadow-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {showDetail ? '상세 결과 접기' : '상세 결과 보기'}
        </button>

        {/* 상세 문제 결과 */}
        {showDetail && (
          <div className="mt-4 space-y-4">
            {questions.map((question, index) => {
              const answer = result.answers.find(a => a.questionId === question.id);
              return (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  userAnswer={answer?.answer || ''}
                  onAnswer={() => {}}
                  showResult={true}
                  isCorrect={answer?.isCorrect}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
