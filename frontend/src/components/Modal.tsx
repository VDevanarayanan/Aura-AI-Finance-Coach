import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/45 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog Content Container */}
      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-2xl transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4.5 dark:border-zinc-800">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          <Button
            variant="ghost"
            className="h-8 w-8 rounded-lg p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={onClose}
          >
            <X className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Body Content */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
