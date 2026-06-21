
import {useNavigate } from 'react-router-dom';

const Index = () => {
    
    const navigate = useNavigate();
    return (
        <section>
            <button onClick={() => navigate('/login')}>Sign in instead</button>  
            <button onClick={() => console.log("hello world")}>Click me if you dare to</button>
        </section>
    )
}

export default Index