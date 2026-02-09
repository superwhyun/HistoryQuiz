export type QuestionType = 'multiple_choice' | 'short_answer' | 'ox';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Era =
  | 'prehistoric'       // 선사시대
  | 'gojoseon'          // 고조선
  | 'early_states'      // 원삼국 (부여, 옥저, 동예, 삼한)
  | 'three_kingdoms'    // 삼국시대 (고구려, 백제, 신라, 가야)
  | 'unified_silla'     // 남북국 (통일신라, 발해)
  | 'goryeo'            // 고려
  | 'joseon_early'      // 조선전기
  | 'joseon_late'       // 조선후기
  | 'enlightenment'     // 개화기/대한제국
  | 'japanese_colonial' // 일제강점기
  | 'modern'            // 현대
  | 'all';              // 전체

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  answer: string;
  explanation: string;
  era: Era;
  difficulty: Difficulty;
  source?: string;
}

export interface QuizConfig {
  count: number;
  difficulty: Difficulty | 'mixed';
  eras: Era[];
  types: QuestionType[];
  title: string;
  includeAnswerSheet: boolean;
  separateAnswerSheet: boolean;
}

export interface UserAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
}

export interface QuizResult {
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  score: number;
  answers: UserAnswer[];
}

export type LLMProvider = 'openai' | 'grok';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
}

export interface GeneratedQuiz {
  title: string;
  questions: Question[];
}
