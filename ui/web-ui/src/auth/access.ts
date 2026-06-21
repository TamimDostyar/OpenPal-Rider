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


    const handleLogin = async (): Promise<boolean> =>{
        try {
            const token = await authenticate.logIntoSystem(email, password);
            setError('');
            localStorage.setItem("token", token);
            return true;
        } catch (e) {
            setError('Invalid email or password');
            return false;
        }
    }

    return { email, setEmail, password, setPassword, handleLogin, error};
}

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