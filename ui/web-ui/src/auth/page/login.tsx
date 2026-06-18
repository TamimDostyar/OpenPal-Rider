import { useAuth } from '../access';


export const LogIn = () => {
    
    
    const {email, setEmail, password, setPassword, handleLogin, error, success} = useAuth();

    return (
    <section>
        <h1>Log into System</h1>
        <input value = {email} onChange={e => setEmail(e.target.value)} placeholder='Email' />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='Password' />

        <button onClick={handleLogin} >Login</button>
        {error && <p style={{color: 'red'}}>{error}</p>}
        {success && <p style={{color: 'green'}}>{success}</p>}
    </section>

)}