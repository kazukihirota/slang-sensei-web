import { Book, LogOut, LogIn, User } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  user: SupabaseUser | null;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Header({ user, onLogin, onLogout }: HeaderProps) {
  return (
    <header className='bg-white/80 backdrop-blur-sm shadow-sm border-b border-indigo-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg'>
              <Book className='h-5 w-5 text-white' />
            </div>
            <h1 className='text-2xl font-bold text-gray-900'>スラング先生</h1>
            <span className='text-sm text-gray-500'>Slang Sensei</span>
          </div>

          <div className='flex items-center space-x-4'>
            {user ? (
              <>
                <div className='flex items-center space-x-2 text-sm text-gray-600'>
                  <User className='h-4 w-4' />
                  <span className='hidden sm:inline'>{user.email}</span>
                </div>
                <button
                  onClick={onLogout}
                  className='flex items-center space-x-1 px-3 py-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors'
                >
                  <LogOut className='h-4 w-4' />
                  <span className='hidden sm:inline'>Sign out</span>
                </button>
              </>
            ) : (
              <button
                onClick={onLogin}
                className='flex items-center space-x-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm'
              >
                <LogIn className='h-4 w-4' />
                <span>Sign up</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
