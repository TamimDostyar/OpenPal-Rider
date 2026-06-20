import {homeService} from '../hooks/home';
import {useNavigate } from 'react-router-dom';

const Home = () => {
    
    const navigate = useNavigate();
    return (
        <section>
            <button onClick={() => navigate('/login')}>Sign in instead</button>  
            <button onClick={homeService}>Click me if you dare to</button>
        </section>
    )
}

export default Home