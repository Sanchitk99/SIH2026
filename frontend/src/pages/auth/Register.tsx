import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { authApi } from '../../services/authApi';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'COLLECTOR' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // 1. Create user in Firebase
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 2. Register role and profile in FastAPI Backend
      await authApi.registerBackendUser({
        name: formData.name,
        phone: formData.phone,
        role: formData.role as 'COLLECTOR' | 'RECYCLER'
      });

      // AuthContext will automatically fetch the new profile and redirect
      navigate(`/${formData.role.toLowerCase()}/dashboard`);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">Create Account</h1>
          <p className="text-gray-500">Join Kabadiwala Connect</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg font-medium border ${formData.role === 'COLLECTOR' ? 'bg-green-50 border-green-600 text-green-700' : 'border-gray-200 text-gray-500'}`}
              onClick={() => setFormData({ ...formData, role: 'COLLECTOR' })}
            >
              Collector
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg font-medium border ${formData.role === 'RECYCLER' ? 'bg-green-50 border-green-600 text-green-700' : 'border-gray-200 text-gray-500'}`}
              onClick={() => setFormData({ ...formData, role: 'RECYCLER' })}
            >
              Recycler
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input required type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input required type="tel" className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input required type="password" minLength={6} className="w-full px-4 py-2 border rounded-lg" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          
          <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 flex justify-center items-center gap-2 mt-4">
            {isSubmitting ? 'Creating account...' : <><UserPlus size={20} /> Create Account</>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/auth/login" className="text-green-600 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}