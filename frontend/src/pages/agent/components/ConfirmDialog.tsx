import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }: ConfirmDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                
                <DialogFooter className="sm:justify-end mt-2">
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={onConfirm}
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmDialog;
