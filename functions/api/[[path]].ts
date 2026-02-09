// Cloudflare Pages Function
// 필요한 경우 API 라우트 추가

export interface Env {
  // KV_NAMESPACE: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  
  // CORS 헤더 설정
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // API 엔드포인트 예시
  if (url.pathname.startsWith('/api/health')) {
    return new Response(
      JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }

  // 404
  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { 
      status: 404,
      headers: { ...headers, 'Content-Type': 'application/json' }
    }
  );
};
