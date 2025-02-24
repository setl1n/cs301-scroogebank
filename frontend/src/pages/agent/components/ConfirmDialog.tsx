import { Dialog, DialogPanel, DialogTitle, Button } from '@headlessui/react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }: ConfirmDialogProps) => {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="mx-auto max-w-sm w-full rounded-lg bg-secondary-800 p-6">
                    <DialogTitle className="text-xl font-bold text-input-text mb-4">
                        {title}
                    </DialogTitle>
                    
                    <p className="text-secondary-200 mb-6">{message}</p>

                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 font-medium rounded-lg bg-secondary-600 text-input-text hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={onConfirm}
                            className="px-4 py-2 font-medium rounded-lg bg-button-bg text-input-text hover:bg-button-hover focus:outline-none focus:ring-2 focus:ring-button-focus transition-colors"
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ConfirmDialog;
