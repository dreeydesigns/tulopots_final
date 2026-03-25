import { NextResponse } from 'next/server';
export async function GET(){ return NextResponse.json({ enabled:true, items:[{ author:'Verified buyer', body:'Beautiful weight and finish.' }] }); }
