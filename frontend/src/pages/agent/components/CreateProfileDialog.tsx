import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

interface CreateProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

type Gender = 'male' | 'female' | 'non-binary' | 'prefer not to say';

interface ProfileData {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | undefined;
    gender: Gender | '';
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

const GENDER_OPTIONS: Gender[] = [
    'male',
    'female',
    'non-binary',
    'prefer not to say'
];

const formatGenderLabel = (gender: Gender): string => {
    return gender
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const initialFormData: ProfileData = {
    firstName: '',
    lastName: '',
    dateOfBirth: undefined,
    gender: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
};

const CreateProfileDialog = ({ isOpen, onClose }: CreateProfileDialogProps) => {
    const [formData, setFormData] = useState<ProfileData>(initialFormData);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const resetForm = () => {
        setFormData(initialFormData);
    };

    const handleClose = () => {
        if (
            formData.firstName !== '' || 
            formData.lastName !== '' || 
            formData.dateOfBirth !== undefined || 
            formData.gender !== '' ||
            formData.email !== '' ||
            formData.phone !== '' ||
            formData.address !== '' ||
            formData.city !== '' ||
            formData.state !== '' ||
            formData.country !== '' ||
            formData.postalCode !== ''
        ) {
            setIsConfirmDialogOpen(true);
        } else {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setIsConfirmDialogOpen(false);
        resetForm();
        onClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (value: string, name: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (date: Date | undefined) => {
        setFormData(prev => ({
            ...prev,
            dateOfBirth: date
        }));
    };

    const handleCreateProfile = async (profileData: ProfileData) => {
        console.log('Creating profile with data:', profileData);
        console.log('Profile created successfully');
        resetForm();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleCreateProfile(formData);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-2xl bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">
                            Create Client Profile
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium text-white">
                                    First Name
                                </Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium text-white">
                                    Last Name
                                </Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-white">
                                    Date of Birth
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 ${
                                                !formData.dateOfBirth && "text-zinc-400"
                                            }`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.dateOfBirth ? (
                                                format(formData.dateOfBirth, "PP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                                        <Calendar
                                            mode="single"
                                            selected={formData.dateOfBirth}
                                            onSelect={handleDateChange}
                                            initialFocus
                                            className="bg-zinc-800 text-white"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender" className="text-sm font-medium text-white">
                                    Gender
                                </Label>
                                <Select 
                                    value={formData.gender} 
                                    onValueChange={(value) => handleSelectChange(value, 'gender')}
                                >
                                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                        {GENDER_OPTIONS.map((gender) => (
                                            <SelectItem key={gender} value={gender}>
                                                {formatGenderLabel(gender)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-white">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-medium text-white">
                                    Phone
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    required
                                />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="address" className="text-sm font-medium text-white">
                                    Address
                                </Label>
                                <Input
                                    id="address"
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-sm font-medium text-white">
                                    City
                                </Label>
                                <Input
                                    id="city"
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-sm font-medium text-white">
                                    State
                                </Label>
                                <Input
                                    id="state"
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country" className="text-sm font-medium text-white">
                                    Country
                                </Label>
                                <Input
                                    id="country"
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postalCode" className="text-sm font-medium text-white">
                                    Postal Code
                                </Label>
                                <Input
                                    id="postalCode"
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                            >
                                Close
                            </Button>
                            <Button type="submit">
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={handleConfirmClose}
                title="Discard Changes?"
                message="Are you sure you want to close? Any unsaved changes will be lost."
            />
        </>
    );
};

export default CreateProfileDialog;
