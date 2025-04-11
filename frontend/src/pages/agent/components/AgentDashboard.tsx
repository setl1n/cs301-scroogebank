import { Button } from '@headlessui/react';
import { useState } from 'react';
import CreateProfileDialog from './CreateProfileDialog';
import TransactionList from './TransactionList';

const AgentDashboard = () => {
    const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
    const [isTransactionListOpen, setIsTransactionListOpen] = useState(false);

    const handleManageProfiles = () => {
        console.log('Manage profiles clicked');
    };

    const handleViewTransactions = () => {
        setIsTransactionListOpen(true);
    };

    const recentActivities = [
        'Created profile for Client1',
        'Updated profile for Client2'
    ];

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-center text-3xl font-bold text-white mb-8">
                Agent Dashboard
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Button
                    onClick={() => setIsCreateProfileOpen(true)}
                    className="px-4 py-3 font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                    Create Client Profile
                </Button>

                <Button
                    onClick={handleManageProfiles}
                    className="px-4 py-3 font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                    Manage Profiles
                </Button>

                <Button
                    onClick={handleViewTransactions}
                    className="px-4 py-3 font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                    View Transactions
                </Button>
            </div>

            <div className="flex-1 bg-secondary-800 rounded-lg p-6 overflow-auto">
                <h3 className="text-xl font-semibold text-white mb-4">My Recent Activities:</h3>
                <ul className="space-y-2">
                    {recentActivities.map((activity, index) => (
                        <li 
                            key={index}
                            className="text-secondary-200 p-3 bg-secondary-700 rounded-md"
                        >
                            {activity}
                        </li>
                    ))}
                </ul>
            </div>

            <CreateProfileDialog
                isOpen={isCreateProfileOpen}
                onClose={() => setIsCreateProfileOpen(false)}
            />

            <TransactionList
                isOpen={isTransactionListOpen}
                onClose={() => setIsTransactionListOpen(false)}
            />
        </div>
    );
};

export default AgentDashboard;
