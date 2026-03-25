import { NextResponse } from 'next/server';
export async function POST(req:Request){ const data = await req.formData(); return NextResponse.json({ ok:true, email:data.get('email') }); }
