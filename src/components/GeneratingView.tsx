import { useState, useEffect } from 'react';
import { Lightbulb, BookOpen, Clock, Star } from 'lucide-react';

const TIPS = [
  {
    icon: Lightbulb,
    title: '알고 계셨나요?',
    content: '세종대왕은 한글 창제 외에도 측우기, 해시계 등 과학 기구를 발명했습니다.',
  },
  {
    icon: BookOpen,
    title: '공부 팁',
    content: '역사는 시대 흐름을 먼저 파악하고, 세부 사건을 연결하면 기억하기 쉬워요.',
  },
  {
    icon: Star,
    title: '알고 계셨나요?',
    content: '고려는 918년부터 1392년까지 약 474년간 지속된 왕조입니다.',
  },
  {
    icon: Clock,
    title: '시험 팁',
    content: '한국사 능력검정시험은 기본(4~6급)과 심화(1~3급)로 나뉩니다.',
  },
  {
    icon: Lightbulb,
    title: '알고 계셨나요?',
    content: '임진왜란 때 이순신 장군은 23전 23승 무패의 기록을 세웠습니다.',
  },
  {
    icon: BookOpen,
    title: '공부 팁',
    content: '연표를 직접 그려보면 시대별 주요 사건을 한눈에 파악할 수 있어요.',
  },
  {
    icon: Star,
    title: '알고 계셨나요?',
    content: '조선 시대 과거 시험은 3년마다 열리는 식년시가 기본이었습니다.',
  },
  {
    icon: Clock,
    title: '시험 팁',
    content: '사료 해석 문제는 핵심 키워드를 찾아 시대를 추론하는 것이 중요해요.',
  },
  {
    icon: Lightbulb,
    title: '알고 계셨나요?',
    content: '신라 진흥왕은 4개의 순수비를 세워 영토 확장을 기념했습니다.',
  },
  {
    icon: BookOpen,
    title: '공부 팁',
    content: '인물 중심으로 공부하면 그 시대의 정치, 문화를 함께 이해할 수 있어요.',
  },
  {
    icon: Star,
    title: '알고 계셨나요?',
    content: '대한민국 임시정부는 1919년 상하이에서 수립되었습니다.',
  },
  {
    icon: Clock,
    title: '시험 팁',
    content: '비슷한 시기의 사건들은 원인-결과 관계로 묶어서 암기하면 효과적이에요.',
  },
];

interface GeneratingViewProps {
  questionCount: number;
}

export function GeneratingView({ questionCount }: GeneratingViewProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  // 팁 로테이션 (4초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
        setFadeState('in');
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentTip = TIPS[currentTipIndex];
  const Icon = currentTip.icon;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 메인 로딩 */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">
            AI가 문제를 생성하고 있습니다...
          </h2>
          <p className="text-gray-600 mt-2">
            {questionCount}개의 문제를 준비 중입니다
          </p>
        </div>

        {/* 팁/광고 카드 */}
        <div
          className={`bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100 transition-opacity duration-300 ${
            fadeState === 'in' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900 text-sm">
                {currentTip.title}
              </h3>
              <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                {currentTip.content}
              </p>
            </div>
          </div>

          {/* 인디케이터 */}
          <div className="flex justify-center gap-1 mt-4">
            {TIPS.slice(0, 6).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentTipIndex % 6
                    ? 'bg-indigo-600'
                    : 'bg-indigo-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
