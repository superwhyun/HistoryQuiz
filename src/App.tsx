import { useQuiz } from './hooks/useQuiz';
import { QuizConfigPanel } from './components/QuizConfig';
import { QuizPlayer } from './components/QuizPlayer';
import { QuizResultView } from './components/QuizResult';
import { QuizReadyView } from './components/QuizReadyView';
import { GeneratingView } from './components/GeneratingView';
import type { QuizConfig, LLMConfig } from './types';
import { useState } from 'react';

function App() {
  const {
    state,
    questions,
    answers,
    result,
    error,
    currentQuestionIndex,
    generateQuiz,
    setAnswer,
    goToNext,
    goToPrev,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    restartSameQuiz,
    startQuiz,
  } = useQuiz();

  const [lastConfig, setLastConfig] = useState<QuizConfig | null>(null);

  const handleGenerate = async (config: QuizConfig, llmConfig: LLMConfig) => {
    setLastConfig(config);
    await generateQuiz(config, llmConfig);
  };

  // 에러 표시
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={resetQuiz}
            className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 설정 화면 (초기 상태 포함)
  if (state === 'config' || !state) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <QuizConfigPanel
          onSubmit={handleGenerate}
          isLoading={false}
        />
      </div>
    );
  }

  // 생성 중
  if (state === 'generating' && lastConfig) {
    return <GeneratingView questionCount={lastConfig.count} />;
  }

  // 문제집 준비 완료 화면
  if (state === 'ready' && lastConfig) {
    return (
      <QuizReadyView
        questions={questions}
        config={lastConfig}
        onStartQuiz={startQuiz}
        onReset={resetQuiz}
      />
    );
  }

  // 결과 화면
  if (state === 'result' && result && lastConfig) {
    return (
      <QuizResultView
        questions={questions}
        result={result}
        config={lastConfig}
        onReset={resetQuiz}
        onRestart={restartSameQuiz}
      />
    );
  }

  // 퀴즈 진행 화면
  if (state === 'quiz' && lastConfig) {
    return (
      <QuizPlayer
        questions={questions}
        config={lastConfig}
        answers={answers}
        currentIndex={currentQuestionIndex}
        onAnswer={setAnswer}
        onNext={goToNext}
        onPrev={goToPrev}
        onGoTo={goToQuestion}
        onSubmit={submitQuiz}
        onReset={resetQuiz}
      />
    );
  }

  // fallback - 설정 화면으로
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <QuizConfigPanel
        onSubmit={handleGenerate}
        isLoading={false}
      />
    </div>
  );
}

export default App;
