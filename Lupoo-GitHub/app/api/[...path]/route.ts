import type { NextRequest } from 'next/server';
const backend = 'https://lupoo-coming-soon.pavle-ai-automation.chatgpt.site';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;
async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const allowed = request.method === 'GET'
    ? pathname === '/api/admin/subscribers'
    : ['/api/subscribe','/api/unsubscribe'].includes(pathname);
  const headers = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  if (!allowed) return Response.json({error:'Not found.'},{status:404,headers});
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) return Response.json({error:'Request not allowed.'},{status:403,headers});
  try {
    let body: string | undefined;
    if(request.method === 'POST') {
      if(!request.headers.get('content-type')?.includes('application/json')) return Response.json({error:'Please send JSON.'},{status:415,headers});
      const reader = request.body?.getReader();
      if(!reader) return Response.json({error:'Missing request body.'},{status:400,headers});
      const chunks:Uint8Array[]=[];let size=0;
      for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2048){await reader.cancel();return Response.json({error:'Request too large.'},{status:413,headers});}chunks.push(value);}
      const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}body=new TextDecoder().decode(bytes);
    }
    const upstreamHeaders = new Headers({'Content-Type':'application/json','Origin':backend});
    const authorization=request.headers.get('authorization');
    if(authorization && pathname === '/api/admin/subscribers') upstreamHeaders.set('Authorization',authorization);
    const response=await fetch(backend+pathname+request.nextUrl.search,{method:request.method,headers:upstreamHeaders,body,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(25000)});
    if(!response.headers.get('content-type')?.includes('application/json')) throw new Error('Unexpected backend response');
    return new Response(response.body,{status:response.status,headers:{...headers,'Content-Type':'application/json'}});
  }catch{return Response.json({error:'Temporarily unavailable. Please try again.'},{status:502,headers});}
}
export const GET=proxy;
export const POST=proxy;
