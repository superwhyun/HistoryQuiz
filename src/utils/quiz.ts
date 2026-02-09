import type { Question, UserAnswer, QuizResult } from '../types';

export function checkAnswer(question: Question, userAnswer: string): boolean {
  if (!userAnswer) return false;
  
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = question.answer.trim().toLowerCase();
  
  // OX 문제
  if (question.type === 'ox') {
    return normalizedUser === normalizedCorrect ||
           (normalizedCorrect === 'o' && normalizedUser === '○') ||
           (normalizedCorrect === 'x' && normalizedUser === '×');
  }
  
  // 객관식
  if (question.type === 'multiple_choice') {
    // 번호로 답한 경우 (1, 2, 3, 4) 또는 보기 문자로 답한 경우 (A, B, C, D)
    const optionIndex = question.options?.findIndex(
      opt => opt.trim().toLowerCase() === normalizedCorrect
    );
    
    if (optionIndex !== undefined && optionIndex !== -1) {
      const correctLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
      const correctNumber = String(optionIndex + 1); // 1, 2, 3, 4
      
      return normalizedUser === normalizedCorrect ||
             normalizedUser === correctLetter.toLowerCase() ||
             normalizedUser === correctNumber;
    }
  }
  
  // 주관식 - 완전 일치 또는 포함 관계
  return normalizedUser === normalizedCorrect ||
         normalizedCorrect.includes(normalizedUser) ||
         normalizedUser.includes(normalizedCorrect);
}

export function calculateResult(
  questions: Question[],
  userAnswers: Map<string, string>
): QuizResult {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  
  const answers: UserAnswer[] = questions.map(q => {
    const userAnswer = userAnswers.get(q.id) || '';
    
    if (!userAnswer) {
      unanswered++;
      return { questionId: q.id, answer: userAnswer, isCorrect: false };
    }
    
    const isCorrect = checkAnswer(q, userAnswer);
    if (isCorrect) correct++;
    else wrong++;
    
    return { questionId: q.id, answer: userAnswer, isCorrect };
  });
  
  const score = Math.round((correct / questions.length) * 100);
  
  return {
    total: questions.length,
    correct,
    wrong,
    unanswered,
    score,
    answers,
  };
}

export function saveQuizToStorage(questions: Question[], answers: Map<string, string>) {
  const data = {
    questions,
    answers: Array.from(answers.entries()),
    timestamp: Date.now(),
  };
  localStorage.setItem('history-quiz-current', JSON.stringify(data));
}

export function loadQuizFromStorage(): { questions: Question[]; answers: Map<string, string> } | null {
  const saved = localStorage.getItem('history-quiz-current');
  if (!saved) return null;
  
  try {
    const data = JSON.parse(saved);
    return {
      questions: data.questions,
      answers: new Map(data.answers),
    };
  } catch {
    return null;
  }
}

export function clearQuizStorage() {
  localStorage.removeItem('history-quiz-current');
}
