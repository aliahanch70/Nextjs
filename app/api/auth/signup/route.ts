// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    // Parse the request body to get username and password
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' });
    }

    // Connect to the database
    await connectMongo();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const newUser = await User.create({ username, password: hashedPassword });

    return NextResponse.json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error in signup route:', error);
    return NextResponse.json({ message: 'Error creating user', error });
  }
}
