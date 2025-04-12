import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                    variant="default"
                >
                    Create Client Profile
                </Button>

                <Button
                    onClick={handleManageProfiles}
                    variant="default"
                >
                    Manage Profiles
                </Button>

                <Button
                    onClick={handleViewTransactions}
                    variant="default"
                >
                    View Transactions
                </Button>
            </div>

            <Card className="flex-1 bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-white">My Recent Activities</CardTitle>
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
