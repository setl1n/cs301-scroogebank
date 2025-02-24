import React from 'react';

const AdminDashboard = () => {
    const actionButtons = [
        { title: 'Create New Account', action: () => console.log('Create account clicked') },
        { title: 'Manage Accounts', action: () => console.log('Manage accounts clicked') },
        { title: 'View Transactions', action: () => console.log('View transactions clicked') },
        { title: 'Settings', action: () => console.log('Settings clicked') },
    ];

    const recentActivities = [
        'User1 created an account',
        'User2 updated profile details'
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-center text-3xl font-bold text-white">
                Admin Dashboard
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actionButtons.map((button, index) => (
                    <button
                        key={index}
                        onClick={button.action}
                        className="px-4 py-3 font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                    >
                        {button.title}
                    </button>
                ))}
            </div>

            <div className="bg-secondary-800 rounded-lg p-6">
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
        </div>
    );
};

export default AdminDashboard;
