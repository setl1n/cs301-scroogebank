import { Dialog, Button, DialogPanel, DialogTitle } from '@headlessui/react';

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
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="mx-auto max-w-2xl w-full rounded-lg bg-secondary-800 p-6">
                    <DialogTitle className="text-2xl font-bold text-input-text mb-6">
                        Manage Accounts
                    </DialogTitle>

                    <div className="space-y-4">
                        {/* Search Section */}
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Search accounts..."
                                className="w-full px-4 py-2 rounded-lg bg-input-bg border border-input-border text-input-text focus:outline-none focus:ring-2 focus:ring-input-focus"
                            />
                            <div className="flex gap-3">
                                <Button
                                    className="px-4 py-2 rounded-lg bg-button-bg text-input-text hover:bg-button-hover focus:outline-none focus:ring-2 focus:ring-button-focus transition-colors"
                                >
                                    Search
                                </Button>
                                {/* Currently using the same "Create Account" Function as Create New Account from Dashboard, actual implementation may need to be a diff function. */}
                                <Button 
                                    onClick={onCreateAccount}
                                    className="px-4 py-2 rounded-lg bg-button-bg text-input-text hover:bg-button-hover focus:outline-none focus:ring-2 focus:ring-button-focus transition-colors"
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
                                    <div 
                                        key={account.id}
                                        className="p-3 bg-secondary-700 rounded-lg"
                                    >
                                        <span className="text-white">
                                            Account ID: {account.id}, Client: {account.name}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-end gap-3 mt-4">
                                    <Button
                                        onClick={() => handleEdit()}
                                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete()}
                                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ManageAccountsDialog;
