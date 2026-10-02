export class InputError extends Error { constructor(message: string, public status = 400) { super(message); } }
const origins = new Set(['https://vistall.com.br','https://www.vistall.com.br','https://vistall.nlsites01.workers.dev']);
export async function readPublicInput(request: Request): Promise<Record<string, unknown>> {
  const origin = request.headers.get('origin');
  if (origin && !origins.has(origin)) throw new InputError('Origem não autorizada.',403);
  if ((request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase() !== 'application/json') throw new InputError('Formato inválido.',415);
  if (Number(request.headers.get('content-length')) > 16384) throw new InputError('Pedido muito grande.',413);
  if (!request.body) throw new InputError('Dados inválidos.');
  const reader=request.body.getReader(); const chunks: Uint8Array[]=[]; let size=0;
  try { while(true) { const {done,value}=await reader.read(); if(done) break; size+=value.byteLength; if(size>16384){await reader.cancel();throw new InputError('Pedido muito grande.',413);} chunks.push(value); } } finally { reader.releaseLock(); }
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let data: unknown;try{data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw new InputError('Dados inválidos.');}
  if(!data || typeof data !== 'object' || Array.isArray(data)) throw new InputError('Dados inválidos.');
  const input=data as Record<string,unknown>;
  for(const key of ['service','business','website','notes','email','extra']) { if(input[key] !== undefined && typeof input[key] !== 'string') throw new InputError('Confira os dados informados.'); }
  return input;
}
export function publicError(error: unknown) { return Response.json({error:error instanceof InputError ? error.message : 'Não conseguimos receber o pedido agora. Tente novamente mais tarde.'},{status:error instanceof InputError ? error.status : 503,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}}); }