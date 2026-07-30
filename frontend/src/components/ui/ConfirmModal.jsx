import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Konfirmasi Aksi", 
  message = "Apakah Anda yakin ingin melanjutkan?", 
  confirmText = "Ya, Lanjutkan", 
  cancelText = "Batal",
  variant = "danger",
  isLoading = false 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      <div className="flex items-center gap-2">
        <AlertTriangle size={24} className="text-black shrink-0" />
        <span>{title}</span>
      </div>
    }>
      <div className="space-y-6">
        <p className="text-sm font-bold text-gray-800 leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <Button 
            type="button" 
            onClick={onClose} 
            variant="secondary" 
            disabled={isLoading}
            className="text-xs sm:text-sm"
          >
            {cancelText}
          </Button>
          <Button 
            type="button" 
            onClick={onConfirm} 
            variant={variant} 
            disabled={isLoading}
            className="text-xs sm:text-sm"
          >
            {isLoading ? 'Memproses...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
