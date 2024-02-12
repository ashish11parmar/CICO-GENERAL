import React from 'react'
import '../style/login.css'
import { Link } from 'react-router-dom'

const Login = () => {
    return (
        <>
            <div class="container">
                <div class="card">
                    <h2>Login</h2>
                    <form>
                        <input type="text" id="username" name="username" placeholder="Username" required />
                        <input type="password" id="password" name="password" placeholder="Password" required />
                        <button type="submit">Login</button>
                        <p>Don't have an account? <Link to='/register'> Register</Link></p>
                    </form>
                </div>
            </div>

        </>
    )
}

export default Login