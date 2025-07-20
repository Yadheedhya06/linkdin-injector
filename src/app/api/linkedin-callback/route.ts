import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.json({ error: 'Authorization failed', details: error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
  }

  console.log(`Received authorization code: ${code}`);
  return NextResponse.json({
    message: 'Authorization successful! Copy this code and exchange it for an access token.',
    code: code,
    nextStep: 'Use this code in a POST to https://www.linkedin.com/oauth/v2/accessToken with your client_id, client_secret, etc.'
  });
}