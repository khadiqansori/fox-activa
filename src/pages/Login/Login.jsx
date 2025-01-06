import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    useEffect(() => {
        document.body.classList.add('bg-gradient-primary');

        return () => {
            document.body.classList.remove('bg-gradient-primary');
        };
    }, []);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();

        // Encode email dan password untuk Authorization header
        const encodedCredentials = btoa(`${email}:${password}`);

        try {
            const response = await axios.get(
                'http://localhost:8989/users/login',
                {
                    headers: {
                        Authorization: `Basic ${encodedCredentials}`,
                    },
                }
            );

            const token = response.data.data.access_token;

            // Simpan token di localStorage
            localStorage.setItem('token', token);
            
            // Decode token untuk membaca payload
            const decodedToken = jwtDecode(token);
            localStorage.setItem('user_info', JSON.stringify(decodedToken));

            // Alihkan ke halaman lain (misalnya dashboard)
            window.location.href = '/';
        } catch (error) {
            console.error('Error during login:', error);

            // Tangani pesan error
            if (error.response) {
                setErrorMessage(error.response.data.message || 'Login failed');
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-6">
                    <div className="card o-hidden border-0 shadow-lg my-5">
                        <div className="card-body p-0">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="p-5">
                                        <div className="text-center">
                                            <h1 className="h4 text-gray-900 mb-4">Welcome Back!</h1>
                                        </div>
                                        <form onSubmit={handleLogin} className="user">
                                            <div className="form-group">
                                                <input
                                                    type="email"
                                                    className="form-control form-control-user"
                                                    placeholder="Enter Email Address..."
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="password"
                                                    className="form-control form-control-user"
                                                    placeholder="Password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            {errorMessage && (
                                                <div className="alert alert-danger" role="alert">
                                                    {errorMessage}
                                                </div>
                                            )}
                                            <button type="submit" className="btn btn-primary btn-user btn-block">
                                                Login
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
