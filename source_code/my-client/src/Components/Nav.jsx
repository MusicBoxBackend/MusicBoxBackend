
import { NavLink } from "react-router-dom";

const Nav = props => {

    function isAdmin()
    {
        if (sessionStorage.getItem('admin') === 'true')
            return true
        return false
    }


        return (
            <>
            
            <div id = "nav">
                <div class="navbar-container">
                    
                    <ul class="navbar">
                        <li><NavLink to = "/">Welcome</NavLink></li>
                        <li><NavLink to = "/link">Link</NavLink></li>
                        <li><NavLink to = "/contact">Contact</NavLink></li>
                        {isAdmin() && (<li><NavLink to = "/upload">Admin</NavLink></li>)}
                        <li><NavLink to = {props.token()? "/account": "/login"} key = "1">{props.token()? "My Account": "Login"}</NavLink></li>
                    </ul>
                
                </div>
                <hr></hr>
            </div>

            
            </>
        )
    }

    

export default Nav;