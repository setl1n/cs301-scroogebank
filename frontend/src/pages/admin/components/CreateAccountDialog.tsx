import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreateAccountDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

type AccountType = 'admin' | 'agent';

const CreateAccountDialog = ({ isOpen, onClose }: CreateAccountDialogProps) => {
    const [accountType, setAccountType] = useState<AccountType>('agent');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Creating account:', { accountType, email, phone });
        // Reset form and close dialog
        setEmail('');
        setPhone('');
        onClose();
    };

    const handleTypeChange = (value: string) => {
        setAccountType(value as AccountType);
    };

    const getBgColor = () => {
        return accountType === 'admin' 
            ? "bg-red-950 border-red-900" 
            : "bg-blue-950 border-blue-900";
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className={`sm:max-w-md border text-white transition-colors duration-200 ${getBgColor()}`}
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">
                        Create {accountType === 'admin' ? 'Admin' : 'Agent'} Account
                    </DialogTitle>
                    <DialogDescription className="text-zinc-300">
                        Fill in the details to create a new account.
                    </DialogDescription>
                </DialogHeader>

                <Tabs 
                    defaultValue="agent" 
                    value={accountType} 
                    onValueChange={handleTypeChange}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger 
                            value="admin"
                            className="data-[state=active]:bg-red-800 data-[state=active]:text-white"
                        >
                            Admin Account
                        </TabsTrigger>
                        <TabsTrigger 
                            value="agent"
                            className="data-[state=active]:bg-blue-800 data-[state=active]:text-white"
                        >
                            Agent Account
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-zinc-200">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`border ${accountType === 'admin' ? 'bg-red-900/30 border-red-800' : 'bg-blue-900/30 border-blue-800'} text-white`}
                            placeholder="email@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-zinc-200">
                            Phone Number
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`border ${accountType === 'admin' ? 'bg-red-900/30 border-red-800' : 'bg-blue-900/30 border-blue-800'} text-white`}
                            placeholder="+1 (555) 123-4567"
                            required
                        />
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className={accountType === 'admin' ? 'bg-red-800 border-red-700 hover:bg-red-700' : 'bg-blue-800 border-blue-700 hover:bg-blue-700'}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            className={accountType === 'admin' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}
                        >
                            Create Account
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateAccountDialog; 