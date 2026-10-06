import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallback: string;
  label?: string;
}

export default function BackButton({ fallback, label = 'Back' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    // If the window history is greater than 2, they likely navigated here from within the app.
    // If not, we fall back to the safe fallback path.
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  return (
    <button 
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4 group"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      {label}
    </button>
  );
}
