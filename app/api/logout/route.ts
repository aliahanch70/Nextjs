import { NextResponse } from 'next/server';

export async function GET() {
  // Create a response object
  const response = NextResponse.json({ message: 'Logged out' });

  // Set the JWT token cookie with Max-Age=0 to delete it
  response.cookies.set('token', '', {
    maxAge: 0, // Immediately expire the cookie
    path: '/',  // Ensure it's deleted site-wide
  });

  return response;
}
