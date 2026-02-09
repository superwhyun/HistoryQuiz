import OpenAI from 'openai';
import type { QuizConfig, Question, LLMConfig } from '../types';

const ERA_DESCRIPTIONS: Record<string, string> = {
  prehistoric: '선사시대(구석기, 신석기, 청동기)',
  gojoseon: '고조선(단군조선, 위만조선, 한사군 설치)',
  early_states: '원삼국시대(부여, 옥저, 동예, 삼한)',
  three_kingdoms: '삼국시대(고구려, 백제, 신라, 가야)',
  unified_silla: '남북국시대(통일신라, 발해)',
  goryeo: '고려시대(918-1392)',
  joseon_early: '조선전기(1392-1592, 태조~선조, 임진왜란 이전)',
  joseon_late: '조선후기(1592-1876, 임진왜란~강화도조약)',
  enlightenment: '개화기/대한제국(1876-1910, 개항~경술국치)',
  japanese_colonial: '일제강점기(1910-1945)',
  modern: '현대(1945~현재, 해방, 분단, 민주화)',
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
  multiple_choice: '객관식(4개 보기)',
  short_answer: '주관식(단답형)',
  ox: 'OX퀴즈',
};

function generatePrompt(config: QuizConfig): string {
  const eras = config.eras.map(e => ERA_DESCRIPTIONS[e]).join(', ');
  const types = config.types.map(t => TYPE_DESCRIPTIONS[t]).join(', ');
  
  return `당신은 한국 역사 전문가입니다. 다음 조건에 맞는 한국사 문제를 ${config.count}개 생성해주세요.

[출제 조건]
- 시대: ${eras}
- 문제 유형: ${types}
- 난이도: ${config.difficulty === 'mixed' ? '쉬움/중간/어려움 적절히 혼합' : config.difficulty}
- 문제 수: ${config.count}개

[유효한 era 값] (반드시 아래 값만 사용)
- prehistoric (선사시대)
- gojoseon (고조선)
- early_states (원삼국)
- three_kingdoms (삼국시대)
- unified_silla (남북국시대)
- goryeo (고려)
- joseon_early (조선전기)
- joseon_late (조선후기)
- enlightenment (개화기)
- japanese_colonial (일제강점기)
- modern (현대)

[응답 형식 - 반드시 JSON으로만 응답]
{
  "questions": [
    {
      "id": "1",
      "type": "multiple_choice",
      "content": "문제 내용",
      "options": ["보기1", "보기2", "보기3", "보기4"],
      "answer": "정답",
      "explanation": "상세 해설 (왜 정답인지, 관련 역사적 맥락 설명)",
      "era": "joseon_early",
      "difficulty": "medium",
      "source": "출처(교과서명, 연도 등)"
    }
  ]
}

[주의사항]
1. 모든 문제는 한국사 전문가 수준의 정확한 내용이어야 합니다.
2. 해설은 학생이 이해할 수 있도록 구체적으로 작성해주세요.
3. 객관식은 반드시 4개 보기를 제공하세요.
4. 각 문제는 고유한 id(숫자 문자열)를 가져야 합니다.
5. JSON 형식 외의 텍스트는 포함하지 마세요.`;
}

export async function generateQuestions(
  config: QuizConfig,
  llmConfig: LLMConfig
): Promise<Question[]> {
  const prompt = generatePrompt(config);

  if (llmConfig.provider === 'openai') {
    return generateWithOpenAI(prompt, llmConfig);
  } else {
    return generateWithGrok(prompt, llmConfig);
  }
}

async function generateWithOpenAI(
  prompt: string,
  config: LLMConfig
): Promise<Question[]> {
  const openai = new OpenAI({
    apiKey: config.apiKey,
    dangerouslyAllowBrowser: true,
  });

  // OpenAI Response API 사용 (GPT-5.2 기본)
  const response = await openai.responses.create({
    model: config.model || 'gpt-5.2',
    input: [
      {
        role: 'system',
        content: '당신은 한국 역사 교육 전문가입니다. 정확하고 교육적인 역사 문제를 생성합니다.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    text: {
      format: {
        type: 'json_object',
      },
    },
    temperature: 0.7,
  });

  const content = response.output_text;
  if (!content) throw new Error('No response from OpenAI');

  const parsed = JSON.parse(content);
  return parsed.questions;
}

async function generateWithGrok(
  prompt: string,
  config: LLMConfig
): Promise<Question[]> {
  // Grok은 OpenAI 호환 API를 제공
  const grok = new OpenAI({
    apiKey: config.apiKey,
    baseURL: 'https://api.x.ai/v1',
    dangerouslyAllowBrowser: true,
  });

  const response = await grok.chat.completions.create({
    model: config.model || 'grok-3-latest',
    messages: [
      {
        role: 'system',
        content: '당신은 한국 역사 교육 전문가입니다. 정확하고 교육적인 역사 문제를 생성합니다. 반드시 요청한 JSON 형식으로만 응답하세요.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from Grok');

  const parsed = JSON.parse(content);
  return parsed.questions;
}
