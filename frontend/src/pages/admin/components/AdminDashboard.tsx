import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <Button
                    onClick={handleCreateAccount}
                    variant="default"
                >
                    Create Account
                </Button>

                <Button
                    onClick={() => setIsManageAccountsOpen(true)}
                    variant="default"
                >
                    Manage Accounts
                </Button>

                <Button
                    onClick={handleViewTransactions}
                    variant="default"
                >
                    View Transactions
                </Button>

                <Button
                    onClick={handleSettings}
                    variant="default"
                >
                    Settings
                </Button>
            </div>

            <Card className="flex-1 bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-white">Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {recentActivities.map((activity, index) => (
                            <li 
                                key={index}
                                className="text-zinc-300 p-3 bg-zinc-800 rounded-md"
                            >
                                {activity}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <ManageAccountsDialog
                isOpen={isManageAccountsOpen}
                onClose={() => setIsManageAccountsOpen(false)}
                onCreateAccount={handleCreateAccount}
            />
        </div>
    );
};

export default AdminDashboard;
