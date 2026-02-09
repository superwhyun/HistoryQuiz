import { useState, useCallback, useEffect } from 'react';
import type { Question, QuizConfig, QuizResult, LLMConfig } from '../types';
import { generateQuestions } from '../utils/llm';
import { calculateResult, saveQuizToStorage, loadQuizFromStorage, clearQuizStorage } from '../utils/quiz';

type QuizState = 'config' | 'generating' | 'ready' | 'quiz' | 'result';

export function useQuiz() {
  const [state, setState] = useState<QuizState>('config');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // 저장된 퀴즈 복원
  useEffect(() => {
    const saved = loadQuizFromStorage();
    if (saved) {
      setQuestions(saved.questions);
      setAnswers(saved.answers);
      setState('quiz');
    }
  }, []);

  // 답변 저장 시 로컬 스토리지 업데이트
  useEffect(() => {
    if (questions.length > 0) {
      saveQuizToStorage(questions, answers);
    }
  }, [questions, answers]);

  const generateQuiz = useCallback(async (config: QuizConfig, llmConfig: LLMConfig) => {
    setState('generating');
    setError(null);
    
    try {
      const generated = await generateQuestions(config, llmConfig);
      setQuestions(generated);
      setAnswers(new Map());
      setCurrentQuestionIndex(0);
      setState('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : '문제 생성 중 오류가 발생했습니다.');
      setState('config');
    }
  }, []);

  const setAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => {
      const next = new Map(prev);
      next.set(questionId, answer);
      return next;
    });
  }, []);

  const goToNext = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  const goToPrev = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(Math.max(0, Math.min(index, questions.length - 1)));
  }, [questions.length]);

  const submitQuiz = useCallback(() => {
    const result = calculateResult(questions, answers);
    setResult(result);
    setState('result');
    clearQuizStorage();
  }, [questions, answers]);

  const resetQuiz = useCallback(() => {
    setQuestions([]);
    setAnswers(new Map());
    setResult(null);
    setCurrentQuestionIndex(0);
    setError(null);
    setState('config');
    clearQuizStorage();
  }, []);

  const restartSameQuiz = useCallback(() => {
    setAnswers(new Map());
    setResult(null);
    setCurrentQuestionIndex(0);
    setState('quiz');
  }, []);

  const startQuiz = useCallback(() => {
    setState('quiz');
  }, []);

  return {
    state,
    questions,
    answers,
    result,
    error,
    currentQuestionIndex,
    currentQuestion: questions[currentQuestionIndex],
    generateQuiz,
    setAnswer,
    goToNext,
    goToPrev,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    restartSameQuiz,
    startQuiz,
  };
}
