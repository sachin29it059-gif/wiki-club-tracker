'use client';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { sendSignInLinkToEmail } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // College Email Domain Check
    if (!email.endsWith('@satiengg.in')) {
      setMessage('⚠️ Please use your official college email ID (ending with @satiengg.in)');
      setLoading(false);
      return;
    }

    const actionCodeSettings = {
      url: window.location.origin + '/dashboard',
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('✅ Magic login link has been sent to your college email inbox!');
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-2 text-center">Club Contribution Tracker</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">Sign in using your college email only</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">College Email</label>
            <input
              type="email"
              required
              placeholder="yourname@satiengg.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition duration-200"
          >
            {loading ? 'Sending Link...' : 'Send Magic Link'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-yellow-400">{message}</p>
        )}
      </div>
    </div>
  );
}