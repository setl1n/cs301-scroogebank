import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ManageAccountsDialog from './ManageAccountsDialog';
import { DollarSign, Users, ShoppingCart, Activity, MoreVertical } from "lucide-react";

const AdminDashboard = () => {
    const [isManageAccountsOpen, setIsManageAccountsOpen] = useState(false);

    const handleCreateAccount = () => {
        console.log('Create account clicked');
    };

    // Sample data for accounts
    const accounts = [
        { id: "1234", email: "keni99@example.com", status: "Success", amount: "$316.00" },
        { id: "5678", email: "abe45@example.com", status: "Success", amount: "$242.00" },
        { id: "9101", email: "monserrat44@example.com", status: "Processing", amount: "$837.00" },
        { id: "1213", email: "carmella@example.com", status: "Failed", amount: "$721.00" }
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Accounts
                    </h2>
                    <p className="text-zinc-400">Manage your payments.</p>
                </div>
                <div className="flex items-center">
                    <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
                </div>
            </div>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                <TabsList className="bg-zinc-800 text-zinc-400">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="accounts">Accounts</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
                                            <p className="text-sm text-zinc-400 mb-1">Subscriptions</p>
                                            <h3 className="text-2xl font-bold text-white">+2350</h3>
                                            <p className="text-xs text-green-500 mt-1">+180.1% from last month</p>
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
                                            <p className="text-sm text-zinc-400 mb-1">Sales</p>
                                            <h3 className="text-2xl font-bold text-white">+12,234</h3>
                                            <p className="text-xs text-green-500 mt-1">+19% from last month</p>
                                        </div>
                                        <div className="p-2 bg-zinc-800 rounded-md">
                                            <ShoppingCart className="h-5 w-5 text-zinc-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-zinc-400 mb-1">Active Now</p>
                                            <h3 className="text-2xl font-bold text-white">+573</h3>
                                            <p className="text-xs text-green-500 mt-1">+201 since last hour</p>
                                        </div>
                                        <div className="p-2 bg-zinc-800 rounded-md">
                                            <Activity className="h-5 w-5 text-zinc-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent activities */}
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">Recent Activities</h3>
                                <ul className="space-y-2">
                                    <li className="text-zinc-300 p-3 bg-zinc-800 rounded-md">
                                        User1 created an account
                                    </li>
                                    <li className="text-zinc-300 p-3 bg-zinc-800 rounded-md">
                                        User2 updated profile details
                                    </li>
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
                                <h3 className="text-xl font-semibold text-white">Analytics Content</h3>
                                <p className="text-zinc-400">Analytics data will be displayed here.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent 
                        value="accounts" 
                        className="space-y-4"
                        style={{ minHeight: '650px' }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="relative w-full max-w-sm">
                                <Input
                                    placeholder="Filter emails..."
                                    className="pl-3 bg-zinc-800 border-zinc-700 text-white"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleCreateAccount}
                                    variant="default"
                                >
                                    Create Account
                                </Button>
                                <Button
                                    onClick={() => setIsManageAccountsOpen(true)}
                                    variant="outline"
                                    className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                                >
                                    Manage Accounts
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="h-9 w-9 p-0 bg-zinc-800 border-zinc-700">
                                            <span className="sr-only">Columns</span>
                                            <MoreVertical className="h-4 w-4 text-white" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
                                        <DropdownMenuItem className="cursor-pointer">Status</DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer">Email</DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer">Amount</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="rounded-md border border-zinc-700 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-zinc-800">
                                    <TableRow className="border-zinc-700 hover:bg-zinc-800">
                                        <TableHead className="w-12 text-zinc-400"></TableHead>
                                        <TableHead className="text-zinc-400">Status</TableHead>
                                        <TableHead className="text-zinc-400">Email</TableHead>
                                        <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                        <TableHead className="w-12 text-zinc-400"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-zinc-900">
                                    {accounts.map((account) => (
                                        <TableRow key={account.id} className="border-zinc-700 hover:bg-zinc-800">
                                            <TableCell className="w-12">
                                                <div className="h-4 w-4 rounded-full border border-zinc-700 flex items-center justify-center">
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-sm ${
                                                    account.status === "Success" ? "text-green-500" : 
                                                    account.status === "Processing" ? "text-blue-500" : 
                                                    "text-red-500"
                                                }`}>
                                                    {account.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>{account.email}</TableCell>
                                            <TableCell className="text-right">{account.amount}</TableCell>
                                            <TableCell className="w-12">
                                                <MoreVertical className="h-4 w-4 text-zinc-400" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-zinc-400">0 of 4 row(s) selected.</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 text-white">
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 text-white">
                                    Next
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent 
                        value="notifications" 
                        className="h-full"
                        style={{ minHeight: '650px' }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800 h-full">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold text-white">Notifications</h3>
                                <p className="text-zinc-400">Your notifications will appear here.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>

            <ManageAccountsDialog
                isOpen={isManageAccountsOpen}
                onClose={() => setIsManageAccountsOpen(false)}
                onCreateAccount={handleCreateAccount}
            />
        </div>
    );
};

export default AdminDashboard;
