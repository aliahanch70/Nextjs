import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import Layout from '@/components/Layout';


interface User {
  username: string;
}

export default function Dashboard() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  let user: User | null = null;
  // const router = useRouter();

  if (token) {
    try {
      console.log('JWT Token from Cookie:', token);
      user = jwtDecode<User>(token);
      console.log('Decoded User Info:', user);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  } else {
    console.log('No token found in cookies');
  }
 

  // Render "Loading..." if the user data is not available
  if (!user) {
    return (<div className="min-h-screen flex">
    <Layout user={user} children={undefined}  />

    {/* Main Content */}
    <div className="flex-1 bg-white dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
        Welcome, gust!
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mt-4">
        Yoy can Login.
      </p>

      {/* Logout Button */}
      
    </div>
  </div>)
  }

  return (
    <div className="min-h-screen flex">
      <Layout user={user} children={undefined} />

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-gray-900 p-8">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
          Welcome, {user.username}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          You are logged in as {user.username}.
        </p>

        {/* Logout Button */}
        
      </div>
    </div>
  );
}
