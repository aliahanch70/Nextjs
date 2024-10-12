import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = '24bf7c53523fd285009e938f6931bdea2677c2b8facc7682b6b1dfd57cc0599e'; // Use a strong secret key in production

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Connect to the database
    await connectMongo();

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }

    // Create a JWT token
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    // Set JWT in an HTTP-only cookie
    const response = NextResponse.json({ message: 'Login successful' });
    response.headers.set('Set-Cookie', cookie.serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'test', // Use secure cookies in production
      sameSite: 'strict',
      path: '/',
      maxAge: 3600, // 1 hour
    }));

    console.log('Cookie set with token:', token); // Debugging log
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Error logging in', error });
  }
}
