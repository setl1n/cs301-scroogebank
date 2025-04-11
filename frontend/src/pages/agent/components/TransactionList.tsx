import { Dialog, DialogPanel, DialogTitle, Button } from '@headlessui/react';

interface Transaction {
    id: number;
    amount: number;
    status: 'Completed' | 'Pending' | 'Failed';
}

interface TransactionListProps {
    isOpen: boolean;
    onClose: () => void;
}

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 1001, amount: 500, status: 'Completed' },
    { id: 1002, amount: 750, status: 'Pending' },
    { id: 1003, amount: 200, status: 'Failed' }
];

const TransactionList = ({ isOpen, onClose }: TransactionListProps) => {
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Searching transactions...');
    };

    const handleViewDetails = (id: number) => {
        console.log('Viewing details for transaction:', id);
    };

    const handleRetry = (id: number) => {
        console.log('Retrying transaction:', id);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="mx-auto max-w-4xl w-full rounded-lg bg-secondary-800 p-6">
                    <DialogTitle className="text-2xl font-bold text-input-text mb-6">
                        Transactions
                    </DialogTitle>

                    <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="flex-1 bg-input-bg border border-input-border text-input-text rounded-md focus:ring-2 focus:ring-input-focus p-2.5 transition-colors"
                        />
                        <Button
                            type="submit"
                            className="px-4 py-2 font-medium rounded-lg bg-button-bg text-input-text hover:bg-button-hover focus:outline-none focus:ring-2 focus:ring-button-focus transition-colors"
                        >
                            Search
                        </Button>
                    </form>

                    <div className="overflow-x-auto">
                        <h3 className="text-xl font-semibold text-input-text mb-4">Transaction List:</h3>
                        <table className="w-full text-input-text">
                            <thead>
                                <tr className="bg-secondary-700">
                                    <th className="px-4 py-2 text-left">Transaction ID</th>
                                    <th className="px-4 py-2 text-left">Amount</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_TRANSACTIONS.map((transaction) => (
                                    <tr key={transaction.id} className="border-b border-secondary-700">
                                        <td className="px-4 py-2">Transaction ID: {transaction.id}</td>
                                        <td className="px-4 py-2">Amount: ${transaction.amount}</td>
                                        <td className="px-4 py-2">
                                            <span className={`inline-block px-2 py-1 rounded w-24 text-center ${
                                                transaction.status === 'Completed' ? 'bg-green-600' :
                                                transaction.status === 'Pending' ? 'bg-yellow-600' :
                                                'bg-red-600'
                                            }`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleViewDetails(transaction.id)}
                                                    className="px-3 py-1 text-sm font-medium rounded-lg bg-secondary-600 text-white hover:bg-secondary-700 transition-colors"
                                                >
                                                    View Details
                                                </Button>
                                                {transaction.status === 'Failed' && (
                                                    <Button
                                                        onClick={() => handleRetry(transaction.id)}
                                                        className="px-3 py-1 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                                                    >
                                                        Retry
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end mt-6">
                        <Button
                            onClick={onClose}
                            className="px-4 py-2 font-medium rounded-lg bg-secondary-600 text-white hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-colors"
                        >
                            Close
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default TransactionList;
