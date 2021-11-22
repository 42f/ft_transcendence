import './StyleLoggin.scss'
// import { Fade, Bounce } from "react-awesome-reveal";
import Lock from './other/Vector.png'
import Button  from '@mui/material/Button';

export default function Loggin(){

    return (
       // <Fade delay={1800} direction='up' className='fadeWrapper'>
        <div className='mainLoggin '>
            <div className='welcome '>
                <h1>Welcome to  ft_transcendence</h1>
            </div>
            <div className='lockImg d-flex flex-column'>
                <img src={Lock} alt="" />
                <h1>Connect with 42</h1>
            </div>
            <div className='buttonConnect d-flex'>
                {/* <Bounce delay={1300} className='w-100 h1-100' > */}
                <form className='TextLog w-100 h-100'>
                    <a href="https://api.intra.42.fr/oauth/authorize?client_id=7610cae5bea0cf5544204791cb2461c29e2d38081bcadfb36a30fa7b01531fb4&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fusers%2Fcallback&response_type=code&scope=public&state=coucou42">
                <Button className='buttonMuiConnect ' variant="contained" sx={{borderRadius: 2, textTransform: 'none' }}>
                    Connect
                </Button>
                </a>
        </form>
        {/* </Bounce> */}
        </div>
        </div>
        //</Fade>
    )
}
