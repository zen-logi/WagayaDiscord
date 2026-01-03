import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
    const { login, register } = useAuthStore();
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegister) {
                await register({ username, password });
            } else {
                await login({ username, password });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-lg">
                <h1 className="mb-6 text-center text-2xl font-bold text-foreground">
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                </h1>

                {error && (
                    <div className="mb-4 rounded bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Username</label>
                        <input
                            type="text"
                            className="w-full rounded-md border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">Password</label>
                        <input
                            type="password"
                            className="w-full rounded-md border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-md bg-primary py-2 font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        {isRegister ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                    >
                        {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
}
