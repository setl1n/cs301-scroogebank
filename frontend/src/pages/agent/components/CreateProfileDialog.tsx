import { Dialog, Fieldset, Label, Button, DialogPanel, DialogTitle, Select } from '@headlessui/react';
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
    dateOfBirth: string;
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
    dateOfBirth: '',
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
        if (Object.values(formData).some(value => value !== '')) {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="mx-auto max-w-2xl w-full rounded-lg bg-secondary-800 p-6">
                        <DialogTitle className="text-2xl font-bold text-input-text mb-6">
                            Create Client Profile
                        </DialogTitle>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Fieldset className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="block text-sm font-medium text-input-text mb-1">
                                        First Name
                                    </Label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full bg-input-bg border border-input-border text-input-text rounded-md focus:ring-2 focus:ring-input-focus block p-2.5 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="block text-sm font-medium text-input-text mb-1">
                                        Last Name
                                    </Label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full bg-input-bg border border-input-border text-input-text rounded-md focus:ring-2 focus:ring-input-focus block p-2.5 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="block text-sm font-medium text-input-text mb-1">
                                        Date of Birth
                                    </Label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className="w-full bg-input-bg border border-input-border text-input-text rounded-md focus:ring-2 focus:ring-input-focus block p-2.5 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="block text-sm font-medium text-input-text mb-1">
                                        Gender
                                    </Label>
                                    <Select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full bg-input-bg border border-input-border text-input-text rounded-md focus:ring-2 focus:ring-input-focus block p-2.5 transition-colors"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        {GENDER_OPTIONS.map((gender) => (
                                            <option key={gender} value={gender}>
                                                {formatGenderLabel(gender)}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <Label className="block text-sm font-medium text-input-text mb-1">
                                        Email
                                    </Label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-input-bg border border-input-border text-input-text rounded-md focus:ring-2 focus:ring-input-focus block p-2.5 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="block text-sm font-medium text-input-text mb-1">
                                        Phone
                                    </Label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full bg-input-bg border border-input-border text-input-text rounded-md focus:ring-2 focus:ring-input-focus block p-2.5 transition-colors"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Label className="block text-sm font-medium text-input-text mb-1">
                                        Address
                                    </Label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full bg-input-bg border border-input-border text-input-text rounded-md focus:ring-2 focus:ring-input-focus block p-2.5 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="block text-sm font-medium text-input-text mb-1">
                                        City
                                    </Label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full bg-input-bg border border-input-border text-input-text rounded-md focus:ring-2 focus:ring-input-focus block p-2.5 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="block text-sm font-medium text-input-text mb-1">
                                        State
                                    </Label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="w-full bg-input-bg border border-input-border text-input-text rounded-md focus:ring-2 focus:ring-input-focus block p-2.5 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="block text-sm font-medium text-input-text mb-1">
                                        Country
                                    </Label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full bg-input-bg border border-input-border text-input-text rounded-md focus:ring-2 focus:ring-input-focus block p-2.5 transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="block text-sm font-medium text-input-text mb-1">
                                        Postal Code
                                    </Label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        className="w-full bg-input-bg border border-input-border text-input-text rounded-md focus:ring-2 focus:ring-input-focus block p-2.5 transition-colors"
                                        required
                                    />
                                </div>
                            </Fieldset>

                            <div className="flex justify-end space-x-3 mt-6">
                                <Button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 font-medium rounded-lg bg-secondary-600 text-input-text hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-colors"
                                >
                                    Close
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-4 py-2 font-medium rounded-lg bg-button-bg text-input-text hover:bg-button-hover focus:outline-none focus:ring-2 focus:ring-button-focus transition-colors"
                                >
                                    Save
                                </Button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
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
