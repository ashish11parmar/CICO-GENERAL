import { React, useState } from 'react'
import '../style/login.css'
import { Link, useNavigate } from 'react-router-dom'

const Register = () => {

    const navigate = useNavigate();

    const [user, setuser] = useState({

        name: "", email: "", work: "", phone: "", password: "", cpassword: ""

    });

    let name, value;
    const Handleinput = (e) => {

        name = e.target.name;
        value = e.target.value;
        setuser({ ...user, [name]: value })
        console.log(user);
    }

    const PostData = async (e) => {
        console.log("clicked...");
        e.preventDefault();
        const { name, email, work, phone, password, cpassword } = user;
        const res = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name, email, work, phone, password, cpassword
            })
        })
        const data = await res.json();
        console.log(data);
        console.log(data);
        if (data.status === 422 || !data) {
            window.alert("Invalid Registration")
            console.log("Invalid Registration");
        } else {
            window.alert("Registration  successfull")
            navigate('/login');
        }
    }

    return (
        <>
            <div class="container">
                <div class="card">
                    <h2>Register</h2>
                    <form>
                        <input type="text" value={user.name} onChange={Handleinput} name="name" placeholder="Name" required />
                        <input type="text" value={user.email} onChange={Handleinput} name="email" placeholder="Email" required />
                        <input type="text" value={user.phone} onChange={Handleinput} name="phone" placeholder="Phone" required />
                        <input type="text" value={user.work} onChange={Handleinput} name="work" placeholder="Work" required />
                        <input type="password" value={user.password} onChange={Handleinput} name="password" placeholder="Password" required />
                        <input type="password" value={user.cpassword} onChange={Handleinput} name="cpassword" placeholder="Confirm Password" required />
                        <button type="submit" onClick={PostData} >Register</button>
                        <p>Don't have an account? <Link to='/login'> Register</Link></p>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Register