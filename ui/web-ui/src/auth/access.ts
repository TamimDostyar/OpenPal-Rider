import { useState } from 'react';
import { Authentication } from './auth';


const authenticate = new Authentication();
class Helpers {
    replaceMonth(date: string, newMonth: string): string {
        const slashIndex = date.indexOf('/');
        let result = newMonth + date.slice(slashIndex);

        if (Number(newMonth) === 1) {
            const parts = date.split('/');
            const year = String(Number(parts[2].slice(0, 4)) + 1);
            result = result.replace(parts[2].slice(0, 4), year);
        }

        return result;
    }

    aheadMonth(data: string): string {
        const slashIndex = data.indexOf('/');
        let month = Number(data.slice(0, slashIndex));
        month = month === 12 ? 1 : month + 1;
        return this.replaceMonth(data, month.toString());
    }

}
export const useAuth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [code, setCode] = useState('');
    
    const handleLogin = async (): Promise<boolean> => {
        try {
            const token = await authenticate.logIntoSystem(email, password);
            setError('');
            localStorage.setItem("token", token);
            return true;
        } catch {
            setError('Invalid email or password');
            return false;
        }
    };

    const handleForget = async () => {
        try {
            const response = await authenticate.forgotPassword(email);
            setMessage(response.message);
            setError('');
        } catch (e) {
            setError("Got " + e);
        }
    };
    const handleResetPW = async () => {
        try {
            const response = await authenticate.resetPassword(code, password);
            setMessage(response.message);
            setError('');
        } catch (e){
            setError("Got" + e)
        }
    }

    return { email, setEmail, password, setPassword, error, setError, message, setMessage, handleLogin, handleForget, handleResetPW, code, setCode };
};

export const useTimer = () => {
    const helper = new Helpers();
    const [message, setMessage] = useState('');
    const currentDate: Date = new Date();
    const expire = helper.aheadMonth(currentDate.toLocaleString());

    if (expire.toString() !== currentDate.toLocaleString()){
        setMessage("We remember this until " + expire.toString());
    }
    return {message, setMessage};
}