import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface ManageAccountsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateAccount: () => void;
}

const ManageAccountsDialog = ({ isOpen, onClose, onCreateAccount }: ManageAccountsDialogProps) => {
    const accounts = [
        { id: "1234", name: "John Doe" },
        { id: "5678", name: "Jane Smith" },
        { id: "9101", name: "Alan Turing" }
    ];

    const handleEdit = () => {
        console.log('Edit button pressed.');
    };

    const handleDelete = () => {
        console.log('Delete button pressed.');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">
                        Manage Accounts
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        View and manage user accounts in the system.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Section */}
                    <div className="space-y-3">
                        <Input
                            type="text"
                            placeholder="Search accounts..."
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                className="bg-zinc-800 hover:bg-zinc-700"
                            >
                                Search
                            </Button>
                            <Button 
                                onClick={onCreateAccount}
                            >
                                Add New Account
                            </Button>
                        </div>
                    </div>

                    {/* Account List */}
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Account List:</h3>
                        <div className="space-y-3">
                            {accounts.map((account) => (
                                <Card 
                                    key={account.id}
                                    className="p-3 bg-zinc-800 border-zinc-700"
                                >
                                    <span className="text-white">
                                        Account ID: {account.id}, Client: {account.name}
                                    </span>
                                </Card>
                            ))}
                            <div className="flex justify-end gap-3 mt-4">
                                <Button
                                    onClick={() => handleEdit()}
                                    variant="secondary"
                                    className="bg-zinc-800 hover:bg-zinc-700"
                                >
                                    Edit
                                </Button>
                                <Button
                                    onClick={() => handleDelete()}
                                    variant="destructive"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ManageAccountsDialog;
