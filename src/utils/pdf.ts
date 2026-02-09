import { jsPDF } from 'jspdf';
import type { Question, QuizConfig } from '../types';
import { NanumGothicRegular, NanumGothicBold } from './pdf-fonts';

// 폰트 초기화 상태
let fontsInitialized = false;

function initializeFonts() {
  if (fontsInitialized) return;

  // jsPDF API를 통해 전역 VFS에 폰트 등록
  const callAddFont = function(this: jsPDF) {
    this.addFileToVFS('NanumGothic-Regular.ttf', NanumGothicRegular);
    this.addFileToVFS('NanumGothic-Bold.ttf', NanumGothicBold);
    this.addFont('NanumGothic-Regular.ttf', 'NanumGothic', 'normal');
    this.addFont('NanumGothic-Bold.ttf', 'NanumGothic', 'bold');
  };

  // jsPDF 이벤트 훅 등록
  jsPDF.API.events.push(['addFonts', callAddFont]);
  fontsInitialized = true;
}

// 모듈 로드 시 폰트 초기화
initializeFonts();

function getEraLabel(era: string): string {
  const labels: Record<string, string> = {
    // 정식 코드
    prehistoric: '선사', gojoseon: '고조선', early_states: '원삼국',
    three_kingdoms: '삼국', unified_silla: '남북국', goryeo: '고려',
    joseon_early: '조선전기', joseon_late: '조선후기', enlightenment: '개화기',
    japanese_colonial: '일제강점', modern: '현대', all: '전체',
    // LLM이 생성할 수 있는 대체 코드들
    joseon: '조선', japanese_occupation: '일제강점', japanese: '일제강점',
    colonial: '일제강점', silla: '신라', baekje: '백제', goguryeo: '고구려',
    balhae: '발해', gaya: '가야', buyeo: '부여', samhan: '삼한',
    contemporary: '현대', present: '현대', liberation: '해방후',
    korean_empire: '대한제국', daehan: '대한제국', opening: '개화기',
  };
  return labels[era] || era;
}

function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = { easy: '쉬움', medium: '보통', hard: '어려움' };
  return labels[difficulty] || difficulty;
}

// 보기 번호 형식
const OPTION_NUMBERS = ['(1)', '(2)', '(3)', '(4)', '(5)'];

export async function generateQuestionPDF(
  questions: Question[],
  config: QuizConfig
): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  
  // 헤더
  doc.setFont('NanumGothic', 'bold');
  doc.setFontSize(18);
  doc.text(config.title, pageWidth / 2, y, { align: 'center' });
  
  y += 8;
  doc.setFont('NanumGothic', 'normal');
  doc.setFontSize(10);
  doc.text(`총 ${questions.length}문항 | ${new Date().toLocaleDateString('ko-KR')}`, pageWidth / 2, y, { align: 'center' });
  
  y += 5;
  doc.setDrawColor(51, 51, 51);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  
  y += 10;
  
  // 문제들
  doc.setFontSize(11);
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    // 페이지 넘김 체크
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
    
    // 문제 번호와 메타
    doc.setFont('NanumGothic', 'bold');
    const questionNum = `${i + 1}.`;
    doc.text(questionNum, margin, y);
    
    const meta = `[${getEraLabel(q.era)} | ${getDifficultyLabel(q.difficulty)}]`;
    doc.setFont('NanumGothic', 'normal');
    doc.setFontSize(9);
    doc.text(meta, margin + 8, y);
    
    y += 6;
    
    // 문제 내용 (줄바꿈 처리)
    doc.setFontSize(11);
    const contentLines = doc.splitTextToSize(q.content, contentWidth - 10);
    doc.text(contentLines, margin + 5, y);
    y += contentLines.length * 5 + 3;
    
    // 보기
    if (q.type === 'multiple_choice' && q.options) {
      for (let j = 0; j < q.options.length; j++) {
        const label = OPTION_NUMBERS[j] || `${j + 1}.`;
        const optionText = q.options[j];
        doc.setFont('NanumGothic', 'normal');
        doc.text(label, margin + 10, y);
        const optLines = doc.splitTextToSize(optionText, contentWidth - 20);
        doc.text(optLines, margin + 18, y);
        y += Math.max(optLines.length * 5, 5) + 2;
      }
    } else if (q.type === 'ox') {
      doc.text('○ (O)          × (X)', margin + 10, y);
      y += 8;
    } else {
      // 주관식 답안란
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin + 10, y + 2, margin + 100, y + 2);
      y += 8;
    }
    
    y += 5; // 문제 간 간격
  }
  
  // 푸터 (페이지 번호)
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(153, 153, 153);
    doc.text(`${config.title} - ${i} / ${pageCount}페이지`, pageWidth / 2, 290, { align: 'center' });
  }
  
  return doc.output('blob');
}

export async function generateAnswerPDF(
  questions: Question[],
  config: QuizConfig
): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const pageWidth = 210;
  const margin = 20;
  let y = margin;
  
  // 기본 답안 페이지
  doc.setFont('NanumGothic', 'bold');
  doc.setFontSize(18);
  doc.text(`${config.title} - 기본 답안`, pageWidth / 2, y, { align: 'center' });
  
  y += 10;
  doc.setDrawColor(51, 51, 51);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;
  
  // 답안 목록 (5열 그리드)
  const cols = 5;
  const colWidth = (pageWidth - margin * 2) / cols;
  const rowHeight = 12;

  for (let i = 0; i < questions.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = margin + col * colWidth;
    const cellY = y + row * rowHeight;

    // 페이지 넘김 체크
    if (cellY > 270) {
      doc.addPage();
      y = margin;
    }

    // 테두리
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(x, cellY - 8, colWidth, rowHeight);

    // 문제 번호
    doc.setFont('NanumGothic', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(102, 102, 102);
    doc.text(`${i + 1}`, x + 3, cellY - 1);

    // 답 번호 (원문자로 변환)
    doc.setFont('NanumGothic', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204);
    const q = questions[i];
    let displayAnswer = q.answer;

    // 객관식인 경우 원문자로 변환
    if (q.type === 'multiple_choice' && q.options) {
      const answerIndex = q.options.indexOf(q.answer);
      if (answerIndex >= 0) {
        displayAnswer = OPTION_NUMBERS[answerIndex] || `${answerIndex + 1}`;
      }
    } else if (q.type === 'ox') {
      displayAnswer = q.answer === 'O' ? '○' : '×';
    }

    doc.text(displayAnswer, x + colWidth / 2 + 5, cellY, { align: 'center' });
  }

  // 그리드 높이만큼 y 이동
  const totalRows = Math.ceil(questions.length / cols);
  y += totalRows * rowHeight + 10;
  
  // 상세 해설 페이지
  doc.addPage();
  y = margin;
  
  doc.setFont('NanumGothic', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(`${config.title} - 상세 해설`, pageWidth / 2, y, { align: 'center' });
  
  y += 10;
  doc.setDrawColor(51, 51, 51);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;
  
  // 해설들
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    // 페이지 넘김
    if (y > 250) {
      doc.addPage();
      y = margin;
    }
    
    // 문제 번호와 정답
    doc.setFont('NanumGothic', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204);
    doc.text(`${i + 1}번 문제 정답: ${q.answer}`, margin, y);
    
    y += 8;
    
    // 해설
    doc.setFont('NanumGothic', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    const explainLines = doc.splitTextToSize(q.explanation, pageWidth - margin * 2);
    doc.text(explainLines, margin, y);
    y += explainLines.length * 5 + 3;
    
    // 출처
    if (q.source) {
      doc.setFontSize(9);
      doc.setTextColor(102, 102, 102);
      doc.text(`출처: ${q.source}`, margin, y);
      y += 6;
    }
    
    // 구분선
    doc.setDrawColor(238, 238, 238);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
  }
  
  // 푸터
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(153, 153, 153);
    const label = i === 1 ? '기본 답안' : '상세 해설';
    doc.text(`${label} - ${i} / ${pageCount}페이지`, pageWidth / 2, 290, { align: 'center' });
  }
  
  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
