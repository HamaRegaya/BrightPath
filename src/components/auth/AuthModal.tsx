import React, { useState } from 'react';
import SignUpForm from './SignUpForm';
import SignInForm from './SignInForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  defaultMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess?.(null); // We could get user data here if needed
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl"
          aria-label="Close"
        >
          ✕
        </button>
        
        {/* Auth forms */}
        {mode === 'signin' ? (
          <SignInForm
            onSuccess={handleSuccess}
            onCancel={onClose}
            onSwitchToSignUp={() => setMode('signup')}
          />
        ) : (
          <SignUpForm
            onSuccess={handleSuccess}
            onCancel={onClose}
            onSwitchToSignIn={() => setMode('signin')}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
