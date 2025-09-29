import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../types';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const icons = {
  success: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
  error: <XCircleIcon className="h-6 w-6 text-red-400" />,
  info: <InformationCircleIcon className="h-6 w-6 text-blue-400" />,
};

const borderColors = {
  success: 'border-green-500/50',
  error: 'border-red-500/50',
  info: 'border-blue-500/50',
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300); // Wait for animation
    }, 4700);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);
  
  const handleDismiss = () => {
     setIsExiting(true);
     setTimeout(() => onDismiss(toast.id), 300);
  }

  return (
    <div
      className={`w-full max-w-sm bg-slate-800/80 backdrop-blur-md shadow-2xl rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 border-l-4 ${borderColors[toast.type]} overflow-hidden transition-all duration-300 ease-in-out ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
      style={{ animation: 'fade-in 0.3s ease-out forwards' }}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{icons[toast.type]}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-200">{toast.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleDismiss}
              className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;