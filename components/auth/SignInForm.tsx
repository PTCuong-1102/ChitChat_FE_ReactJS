
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { handleError } from '../../services/errorHandler';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
}

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, type, value, onChange, required = true }) => (
  <div className="mb-6">
    <label className="block text-pink-500 text-sm font-bold mb-2">{label}:</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 rounded-lg bg-white border border-pink-200 focus:border-pink-500 focus:outline-none transition-colors"
    />
  </div>
);

const SignInForm: React.FC<SignInFormProps> = ({ onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ usernameOrEmail: email, password });
    } catch (error) {
      handleError(error, 'Login');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <h2 className="text-3xl font-bold text-pink-500 mb-8 text-center">Sign in</h2>
      <form onSubmit={handleSubmit}>
        <InputField 
          label="Email" 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField 
          label="Password" 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="text-center text-gray-500 text-sm mt-6">
        Don't have an account?{' '}
        <button onClick={onSwitchToSignUp} className="text-pink-500 hover:underline font-bold">
          Sign up now
        </button>
      </p>
    </div>
  );
};

export default SignInForm;
