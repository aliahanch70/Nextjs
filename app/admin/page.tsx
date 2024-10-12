// server/dashboard.tsx (Server Component)
import { cookies } from 'next/headers';
import {jwtDecode} from 'jwt-decode';
import DashboardClient from '@/components/DashboardClient'; // Client Component
import DashboardClient2 from '@/components/ImageUploader';
import ImageUploader from '@/components/ImageUploader';

interface User {
  username: string;
  role: string;
}

export default function DashboardServer() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  let user: User | null = null;

  if (token) {
    try {
      user = jwtDecode<User>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  return (
  <>
     <DashboardClient user={user} />
     <p>dshasss</p>
     <ImageUploader />
  </>
  
)}
