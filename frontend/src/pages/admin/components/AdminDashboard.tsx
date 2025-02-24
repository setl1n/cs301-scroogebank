import { Button } from '@headlessui/react';
import { useState } from 'react';
import ManageAccountsDialog from './ManageAccountsDialog';

const AdminDashboard = () => {
    const [isManageAccountsOpen, setIsManageAccountsOpen] = useState(false);

    const handleCreateAccount = () => {
        console.log('Create account clicked');
    };

    const handleViewTransactions = () => {
        console.log('View transactions clicked');
    };

    const handleSettings = () => {
        console.log('Settings clicked');
    };

    const recentActivities = [
        'User1 created an account',
        'User2 updated profile details'
    ];

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-center text-3xl font-bold text-white mb-8">
                Admin Dashboard
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Button
                    onClick={handleCreateAccount}
                    className="px-4 py-3 font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                    Create New Account
                </Button>

                <Button
                    onClick={() => setIsManageAccountsOpen(true)}
                    className="px-4 py-3 font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                    Manage Accounts
                </Button>

                <Button
                    onClick={handleViewTransactions}
                    className="px-4 py-3 font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                    View Transactions
                </Button>

                <Button
                    onClick={handleSettings}
                    className="px-4 py-3 font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                    Settings
                </Button>
            </div>

            <div className="flex-1 bg-secondary-800 rounded-lg p-6 overflow-auto">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Activities:</h3>
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

            <ManageAccountsDialog
                isOpen={isManageAccountsOpen}
                onClose={() => setIsManageAccountsOpen(false)}
                onCreateAccount={handleCreateAccount}
            />
        </div>
    );
};

export default AdminDashboard;
