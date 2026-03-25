import { NextResponse } from 'next/server';
export async function POST(req:Request){ const data = await req.formData(); return NextResponse.json({ ok:true, message:`Thanks ${data.get('name')}, we received your message.` }); }
