import { useState, useEffect } from 'react';
import axios from 'axios';
import Config from '../Config';

function EmployeesCreate() {
    // Field Input
    const [fullname, setFullname] = useState('');
    const [phone, setPhone] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(0);
    const [address, setAddress] = useState('');

    // Roles option
    const [roles, setRoles] = useState([]);

    // Response
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // Ambil data roles dari API
        const fetchRoles = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${Config.BaseUrl}/roles`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setRoles(response.data.data); // Asumsi API mengembalikan array roles
            } catch (error) {
                console.error('Error fetching roles:', error);
                setErrorMessage('Failed to load roles');
            }
        };

        fetchRoles();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token'); // Pastikan token disimpan di localStorage

        const data = {
            name: fullname,
            phone: phone,
            email: email,
            password: password,
            role: role,
            address: address,
        };

        try {
            const response = await axios.post(
                `${Config.BaseUrl}/create-user`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            setSuccessMessage('User created successfully!');
            console.log(response.data);
            window.location.href = '/employees';
        } catch (error) {
            console.error('Error creating user:', error);
            setErrorMessage(error.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Tambah Karyawan</h1>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Form Tambah Karyawan</h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="fullname" className="form-label">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="fullname"
                                        name="fullname"
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="phone" className="form-label">No. HP</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="phone"
                                        name="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(parseInt(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="role" className="form-label">Jabatan</label>
                                    <select
                                        className="form-control"
                                        id="role"
                                        name="role"
                                        value={role}
                                        onChange={(e) => setRole(parseInt(e.target.value))}
                                        required
                                    >
                                        <option disabled value="">-- Pilih Jabatan --</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="address" className="form-label">Alamat</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="address"
                                        name="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>

                                {errorMessage && (
                                    <div className="alert alert-danger" role="alert">
                                        {errorMessage}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="alert alert-success" role="alert">
                                        {successMessage}
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary mr-3">Submit</button>
                                <a href='/employees' className="btn btn-warning">Cancel</a>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeesCreate;