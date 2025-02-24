import React, { useState } from 'react'
import { Fieldset, Label } from '@headlessui/react'
import eyePassword from '@/assets/eyePassword.svg'
import eyePasswordOff from '@/assets/eyePasswordOff.svg'

interface LoginFormProps {
    onLogin: (username: string, password: string) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!username || !password) {
            return;
        }
        onLogin(username, password);
    };

    return (
        <div>
            <h2 className="text-center text-3xl font-bold text-white">
                CRM Login
            </h2>
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                <Fieldset className="rounded-md shadow-sm space-y-4">
                    <div>
                        <Label className="block text-sm font-medium text-white mb-1">
                            Username
                        </Label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full bg-input-bg border-input-border text-white rounded-md focus:ring-2 focus:ring-input-focus focus:border-input-focus block p-2.5 transition-colors"
                            placeholder="Enter Username"
                        />
                    </div>
                    <div>
                        <Label className="block text-sm font-medium text-white mb-1">
                            Password
                        </Label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-input-bg border-input-border text-white rounded-md focus:ring-2 focus:ring-input-focus focus:border-input-focus block p-2.5 transition-colors"
                                placeholder="Enter Password"
                            />
                            <div
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-secondary-400 cursor-pointer"
                                onClick={togglePasswordVisibility}
                            >
                                <img
                                    src={showPassword ? eyePassword : eyePasswordOff}
                                    alt="Toggle Password Visibility"
                                    className="h-5 w-5"
                                />
                            </div>
                        </div>
                    </div>
                </Fieldset>

                <button
                    type="submit"
                    className="w-full px-4 py-2 font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                    Log in
                </button>
            </form>
        </div>
    );
};

export default LoginForm;
