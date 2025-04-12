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

interface Transaction {
    id: number;
    amount: number;
    status: 'Completed' | 'Pending' | 'Failed';
}

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 1001, amount: 500, status: 'Completed' },
    { id: 1002, amount: 750, status: 'Pending' },
    { id: 1003, amount: 200, status: 'Failed' }
];

const TransactionList = () => {
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
        <>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <Input
                    type="text"
                    placeholder="Search transactions..."
                    className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                />
                <Button type="submit">
                    Search
                </Button>
            </form>

            <div className="overflow-x-auto rounded-md border border-zinc-700">
                <Table>
                    <TableHeader className="bg-zinc-800">
                        <TableRow className="border-zinc-700 hover:bg-zinc-800">
                            <TableHead className="text-zinc-400">Transaction ID</TableHead>
                            <TableHead className="text-zinc-400">Amount</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-zinc-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-zinc-900">
                        {MOCK_TRANSACTIONS.map((transaction) => (
                            <TableRow key={transaction.id} className="border-zinc-700 hover:bg-zinc-800">
                                <TableCell>Transaction ID: {transaction.id}</TableCell>
                                <TableCell>Amount: ${transaction.amount}</TableCell>
                                <TableCell>
                                    <Badge className={
                                        transaction.status === 'Completed' ? "bg-green-600 hover:bg-green-700" :
                                        transaction.status === 'Pending' ? "bg-yellow-600 hover:bg-yellow-700" :
                                        "bg-red-600 hover:bg-red-700"
                                    }>
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
                                        {transaction.status === 'Failed' && (
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
        </>
    );
};

export default TransactionList;
