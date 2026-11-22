import { NextResponse } from 'next/server';
import { getAdminAuthToken, verifyAdminRequest } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = getAdminAuthToken();
    return NextResponse.json({ success: true, token });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Error creating token' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = getAdminAuthToken();
    return NextResponse.json({ success: true, token });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Error creating token' }, { status: 500 });
  }
}
