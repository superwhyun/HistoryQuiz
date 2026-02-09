// Cloudflare Pages Middleware
// 모든 요청에 적용되는 미들웨어

export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();
  
  // 보안 헤더 추가
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
};
