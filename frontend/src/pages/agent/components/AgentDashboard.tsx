import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import CreateProfileDialog from './CreateProfileDialog';
import TransactionList from './TransactionList';
import { DollarSign, Users, Activity, CheckCircle, Search } from "lucide-react";

interface ClientAccount {
    id: string;
    name: string;
}

const AgentDashboard = () => {
    const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<string>("");

    const handleClearSelection = (value: string) => {
        if (value === "all") {
            setSelectedClient("");
        } else {
            setSelectedClient(value);
        }
    };

    const recentActivities = [
        'Created profile for Client1',
        'Updated profile for Client2'
    ];

    // Mock client accounts
    const clientAccounts: ClientAccount[] = [
        { id: "1", name: "Alicia Koch" },
        { id: "2", name: "Acme Inc." },
        { id: "3", name: "Monsters Inc." }
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Agent Dashboard
                    </h2>
                    <p className="text-zinc-400">Manage client accounts and transactions.</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                <TabsList className="bg-zinc-800 text-zinc-400">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="clients">Clients</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>
                
                <div className="flex-1 mt-4 overflow-y-auto h-[650px]">
                    <TabsContent 
                        value="overview" 
                        className="space-y-4 h-full"
                        style={{ minHeight: '650px' }}
                    >
                        {/* Cards with metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-zinc-400 mb-1">Total Clients</p>
                                            <h3 className="text-2xl font-bold text-white">24</h3>
                                            <p className="text-xs text-green-500 mt-1">+3 this month</p>
                                        </div>
                                        <div className="p-2 bg-zinc-800 rounded-md">
                                            <Users className="h-5 w-5 text-zinc-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-zinc-400 mb-1">Total Revenue</p>
                                            <h3 className="text-2xl font-bold text-white">$45,231.89</h3>
                                            <p className="text-xs text-green-500 mt-1">+20% from last month</p>
                                        </div>
                                        <div className="p-2 bg-zinc-800 rounded-md">
                                            <DollarSign className="h-5 w-5 text-zinc-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-zinc-400 mb-1">Success Rate</p>
                                            <h3 className="text-2xl font-bold text-white">98.5%</h3>
                                            <p className="text-xs text-green-500 mt-1">+2.5% from last month</p>
                                        </div>
                                        <div className="p-2 bg-zinc-800 rounded-md">
                                            <CheckCircle className="h-5 w-5 text-zinc-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-zinc-400 mb-1">Completed Transactions</p>
                                            <h3 className="text-2xl font-bold text-white">573</h3>
                                            <p className="text-xs text-green-500 mt-1">+24 since last week</p>
                                        </div>
                                        <div className="p-2 bg-zinc-800 rounded-md">
                                            <Activity className="h-5 w-5 text-zinc-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Chart area placeholder */}
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">Performance Overview</h3>
                                <div className="h-64 flex items-center justify-center border border-dashed border-zinc-700 rounded-md bg-zinc-800/50">
                                    <p className="text-zinc-400">Performance chart would be displayed here</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent activities */}
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">Recent Activities</h3>
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
                    </TabsContent>

                    <TabsContent 
                        value="analytics" 
                        className="h-full"
                        style={{ minHeight: '650px' }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800 h-full">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold text-white">Analytics</h3>
                                <p className="text-zinc-400">Analytics data will be displayed here.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent 
                        value="clients" 
                        className="space-y-4"
                        style={{ minHeight: '650px' }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="relative w-full max-w-sm">
                                <Input
                                    placeholder="Search clients..."
                                    className="pl-9 bg-zinc-800 border-zinc-700 text-white"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={() => setIsCreateProfileOpen(true)}
                                    variant="default"
                                >
                                    Create Client Profile
                                </Button>
                            </div>
                        </div>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <h3 className="text-xl font-semibold text-white">Client List</h3>
                                    <div className="w-64">
                                        <Select value={selectedClient || "all"} onValueChange={handleClearSelection}>
                                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                                <SelectValue placeholder="Select client account" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                                <SelectItem value="all">All Clients</SelectItem>
                                                {clientAccounts.map((client) => (
                                                    <SelectItem key={client.id} value={client.id}>
                                                        {client.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {clientAccounts.map((client) => (
                                        <div 
                                            key={client.id}
                                            className="p-3 bg-zinc-800 rounded-md flex items-center justify-between"
                                        >
                                            <span className="text-white">{client.name}</span>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                                                    View
                                                </Button>
                                                <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent 
                        value="transactions" 
                        className="h-full"
                        style={{ minHeight: '650px' }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">Transactions</h3>
                                <TransactionList />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>

            <CreateProfileDialog
                isOpen={isCreateProfileOpen}
                onClose={() => setIsCreateProfileOpen(false)}
            />
        </div>
    );
};

export default AgentDashboard;
