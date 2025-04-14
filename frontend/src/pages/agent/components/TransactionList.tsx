import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, AuthContextProps } from "react-oidc-context";
import { transactionService } from "@/services/transactionService";
import { clientService } from "@/services/clientService";

interface Transaction {
    id: number;
    clientId: number;
    transactionType: 'D' | 'W';
    amount: number;
    date: string;
    status: string;
    clientName?: string;
}

const TransactionList = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const auth = useAuth();

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Helper function to enrich transactions with client names
    const enrichTransactionsWithClientNames = async (
        transactions: Transaction[], 
        auth: AuthContextProps
    ): Promise<Transaction[]> => {
        // Create a Set of unique client IDs to minimize API calls
        const clientIds = new Set(transactions.map(t => t.clientId));
        const clientMap = new Map();
        
        // Create a client data cache
        const clientDataCache: Record<number, any> = {};
        
        // Fetch client information for each unique client ID
        for (const clientId of clientIds) {
            try {
                const clientData = await clientService.getClientById(clientId, auth);
                
                // Store in cache
                clientDataCache[clientId] = clientData;
                
                if (clientData && clientData.firstName && clientData.lastName) {
                    // Format the client name
                    clientMap.set(clientId, `${clientData.firstName} ${clientData.lastName}`);
                } else {
                    // Fallback to client ID if name not available
                    clientMap.set(clientId, `Client #${clientId}`);
                }
            } catch (error) {
                console.error(`Error fetching client information for client ID ${clientId}:`, error);
                clientMap.set(clientId, `Client #${clientId}`);
            }
        }
        
        // Enrich transactions with client names
        return transactions.map(transaction => ({
            ...transaction,
            clientName: clientMap.get(transaction.clientId) || `Client #${transaction.clientId}`
        }));
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            if (auth.isAuthenticated) {
                const response = await transactionService.getAllTransactions(auth);
                console.log('API Response:', response);
                
                // Check if we got a valid response with the expected structure
                if (response && response.result === true && Array.isArray(response.data)) {
                    // Extract the transaction data array from the response
                    const fetchedTransactions = response.data;
                    const enrichedTransactions = await enrichTransactionsWithClientNames(fetchedTransactions, auth);
                    console.log('Enriched transactions:', enrichedTransactions);
                    setTransactions(enrichedTransactions);
                    setFilteredTransactions(enrichedTransactions);
                    setError(null);
                } else {
                    // Handle unexpected response format
                    console.error('Unexpected response format:', response);
                    setError('Received an invalid response format from the server.');
                }
            } else {
                setError('Authentication required. Please log in.');
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError('Failed to load transactions. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!searchTerm.trim()) {
            setFilteredTransactions(transactions);
            return;
        }
        
        const term = searchTerm.toLowerCase();
        const filtered = transactions.filter(transaction => 
            transaction.id.toString().includes(term) ||
            transaction.amount.toString().includes(term) ||
            transaction.status.toLowerCase().includes(term) ||
            transaction.date.includes(term) ||
            transaction.clientId.toString().includes(term) ||
            transaction.transactionType.toLowerCase().includes(term) ||
            (transaction.clientName && transaction.clientName.toLowerCase().includes(term))
        );
        
        setFilteredTransactions(filtered);
    };

    // Helper function to format date to a more readable format
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handler functions remain the same
    const handleViewDetails = (id: number) => {
        console.log('Viewing details for transaction:', id);
    };

    const handleRetry = (id: number) => {
        console.log('Retrying transaction:', id);
    };

    // Helper function to map transaction status to badge color
    const getStatusBadgeColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower === 'completed') return "bg-green-600 hover:bg-green-700";
        if (statusLower === 'pending') return "bg-yellow-600 hover:bg-yellow-700";
        return "bg-red-600 hover:bg-red-700";
    };

    // Helper function to format transaction type
    const formatTransactionType = (type: 'D' | 'W') => {
        return type === 'D' ? 'Deposit' : 'Withdrawal';
    };

    if (loading) {
        return <div className="py-4 text-center text-zinc-400">Loading transactions...</div>;
    }

    if (error) {
        return <div className="py-4 text-center text-red-500">{error}</div>;
    }

    return (
        <>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <Input
                    type="text"
                    placeholder="Search transactions..."
                    className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit">
                    Search
                </Button>
            </form>

            {filteredTransactions.length === 0 ? (
                <div className="py-4 text-center text-zinc-400">No transactions found.</div>
            ) : (
                <div className="overflow-x-auto rounded-md border border-zinc-700">
                    <Table>
                        <TableHeader className="bg-zinc-800">
                            <TableRow className="border-zinc-700 hover:bg-zinc-800">
                                <TableHead className="text-zinc-400">Transaction ID</TableHead>
                                <TableHead className="text-zinc-400">Client Name</TableHead>
                                <TableHead className="text-zinc-400">Type</TableHead>
                                <TableHead className="text-zinc-400">Amount</TableHead>
                                <TableHead className="text-zinc-400">Date</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                                <TableHead className="text-zinc-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-zinc-900">
                            {filteredTransactions.map((transaction) => (
                                <TableRow key={transaction.id} className="border-zinc-700 hover:bg-zinc-800">
                                    <TableCell>{transaction.id}</TableCell>
                                    <TableCell>{transaction.clientName}</TableCell>
                                    <TableCell>{formatTransactionType(transaction.transactionType)}</TableCell>
                                    <TableCell>${transaction.amount ? transaction.amount.toFixed(2) : '0.00'}</TableCell>
                                    <TableCell>{formatDate(transaction.date)}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusBadgeColor(transaction.status)}>
                                            {transaction.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleViewDetails(transaction.id)}
                                                variant="outline"
                                                size="sm"
                                                className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                                            >
                                                View Details
                                            </Button>
                                            {transaction.status.toLowerCase() === 'failed' && (
                                                <Button
                                                    onClick={() => handleRetry(transaction.id)}
                                                    size="sm"
                                                >
                                                    Retry
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </>
    );
};

export default TransactionList;
