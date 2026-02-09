import { useState, useEffect } from 'react';
import type { QuizConfig, LLMConfig, QuestionType, Era, Difficulty } from '../types';
import { Settings, BookOpen, Brain, FileText, Key } from 'lucide-react';

const LLM_CONFIG_STORAGE_KEY = 'history-quiz-llm-config';

interface QuizConfigProps {
  onSubmit: (config: QuizConfig, llmConfig: LLMConfig) => void;
  isLoading: boolean;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'multiple_choice', label: '객관식' },
  { value: 'short_answer', label: '주관식' },
  { value: 'ox', label: 'OX' },
];

const ERAS: { value: Era; label: string }[] = [
  { value: 'prehistoric', label: '선사시대' },
  { value: 'gojoseon', label: '고조선' },
  { value: 'early_states', label: '원삼국' },
  { value: 'three_kingdoms', label: '삼국시대' },
  { value: 'unified_silla', label: '남북국' },
  { value: 'goryeo', label: '고려' },
  { value: 'joseon_early', label: '조선전기' },
  { value: 'joseon_late', label: '조선후기' },
  { value: 'enlightenment', label: '개화기' },
  { value: 'japanese_colonial', label: '일제강점기' },
  { value: 'modern', label: '현대' },
];

const DIFFICULTIES: { value: Difficulty | 'mixed'; label: string }[] = [
  { value: 'easy', label: '쉬움' },
  { value: 'medium', label: '보통' },
  { value: 'hard', label: '어려움' },
  { value: 'mixed', label: '혼합' },
];

export function QuizConfigPanel({ onSubmit, isLoading }: QuizConfigProps) {
  const [config, setConfig] = useState<QuizConfig>({
    count: 10,
    difficulty: 'mixed',
    eras: ['joseon_late', 'enlightenment', 'japanese_colonial'],
    types: ['multiple_choice'],
    title: '한국사 능력검정 대비 문제집',
    includeAnswerSheet: true,
    separateAnswerSheet: true,
  });

  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: 'openai',
    apiKey: '',
    model: '',
  });

  // 저장된 LLM 설정 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LLM_CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as LLMConfig;
        setLlmConfig(parsed);
      }
    } catch (e) {
      console.error('Failed to load LLM config:', e);
    }
  }, []);

  const handleEraToggle = (era: Era) => {
    setConfig(prev => {
      const eras = prev.eras.includes(era)
        ? prev.eras.filter(e => e !== era)
        : [...prev.eras, era];
      return { ...prev, eras };
    });
  };

  const handleTypeToggle = (type: QuestionType) => {
    setConfig(prev => {
      const types = prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      return { ...prev, types };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.eras.length === 0) {
      alert('최소 하나의 시대를 선택해주세요.');
      return;
    }
    if (config.types.length === 0) {
      alert('최소 하나의 문제 유형을 선택해주세요.');
      return;
    }
    if (!llmConfig.apiKey.trim()) {
      alert('API 키를 입력해주세요.');
      return;
    }
    // API 키 저장
    try {
      localStorage.setItem(LLM_CONFIG_STORAGE_KEY, JSON.stringify(llmConfig));
    } catch (e) {
      console.error('Failed to save LLM config:', e);
    }
    onSubmit(config, llmConfig);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            한국 역사 시험 문제집 생성기
          </h1>
          <p className="text-indigo-100 text-sm mt-1">
            AI로 생성하는 맞춤형 한국사 문제집
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* LLM 설정 */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              LLM API 설정
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제공업체
                </label>
                <select
                  value={llmConfig.provider}
                  onChange={e => setLlmConfig(prev => ({ ...prev, provider: e.target.value as LLMConfig['provider'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="openai">OpenAI (GPT-5.2)</option>
                  <option value="grok">Grok (xAI)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  모델 (선택사항)
                </label>
                <input
                  type="text"
                  placeholder={llmConfig.provider === 'openai' ? 'gpt-5.2' : 'grok-3-latest'}
                  value={llmConfig.model}
                  onChange={e => setLlmConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API 키
              </label>
              <input
                type="password"
                placeholder="sk-... (OpenAI) 또는 xai-... (Grok)"
                value={llmConfig.apiKey}
                onChange={e => setLlmConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                API 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
              </p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* 기본 설정 */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              기본 설정
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                문제집 제목
              </label>
              <input
                type="text"
                value={config.title}
                onChange={e => setConfig(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  문제 수 ({config.count}개)
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={config.count}
                  onChange={e => setConfig(prev => ({ ...prev, count: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  난이도
                </label>
                <select
                  value={config.difficulty}
                  onChange={e => setConfig(prev => ({ ...prev, difficulty: e.target.value as QuizConfig['difficulty'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {DIFFICULTIES.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 시대 선택 */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              출제 시대
            </h2>
            <div className="flex flex-wrap gap-2">
              {ERAS.map(era => (
                <button
                  key={era.value}
                  type="button"
                  onClick={() => handleEraToggle(era.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    config.eras.includes(era.value)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {era.label}
                </button>
              ))}
            </div>
          </div>

          {/* 문제 유형 */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              문제 유형
            </h2>
            <div className="flex flex-wrap gap-2">
              {QUESTION_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeToggle(type.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    config.types.includes(type.value)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* PDF 옵션 */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-medium text-gray-800">PDF 출력 옵션</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeAnswerSheet}
                  onChange={e => setConfig(prev => ({ ...prev, includeAnswerSheet: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">답안지 포함</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.separateAnswerSheet}
                  onChange={e => setConfig(prev => ({ ...prev, separateAnswerSheet: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">답안지를 별도 PDF로 분리</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                문제 생성 중...
              </>
            ) : (
              '문제집 생성하기'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
