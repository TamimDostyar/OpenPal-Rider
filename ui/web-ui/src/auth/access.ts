import { useState } from 'react';
import { Authentication } from './auth';

// this is the accessories of the software - so this won't talk to backend but would work with tsx.
const authenticate = new Authentication();

export const useAuth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleLogin = async () => {
        try {
            const token = await authenticate.logIntoSystem(email, password);
            setError('');
            setSuccess("Successfully authenticated");
            localStorage.setItem("token", token);
        } catch (e) {
            setError('Invalid email or password');
        }
    }

    return { email, setEmail, password, setPassword, handleLogin, error, success};
}
