import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-3xl border-4 border-black neo-brutalism w-full max-w-[95vw] sm:max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b-4 border-black bg-brand-yellow gap-2">
          <div className="text-lg sm:text-2xl font-bold font-serif text-black min-w-0 flex-1 break-words">{title}</div>
          <button 
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-xl border-2 border-black bg-white hover:bg-red-100 transition-colors neo-brutalism text-black cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
