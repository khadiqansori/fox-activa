import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Config from '../Config';

const EmployeesUpdate = () => {
    const { id } = useParams();
    
    const [fullname, setFullname] = useState('');
    const [phone, setPhone] = useState(0);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [address, setAddress] = useState('');
    const [photo, setPhoto] = useState('');
    const [roles, setRoles] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Mengambil data roles dari API
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${Config.BaseUrl}/roles`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                setRoles(response.data.data); // Set roles data
            } catch (error) {
                setErrorMessage('Failed to load roles');
                console.error('Error fetching roles:', error);
            }
        };

        fetchRoles();
    }, []);

    // Mengambil data user berdasarkan id untuk update
    useEffect(() => {
        const fetchOldData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${Config.BaseUrl}/user/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                const data = response.data.data;
                setFullname(data.name);
                setPhone(data.phone);
                setEmail(data.email);
                setRole(data.role);
                setAddress(data.address);
                setPhoto(data.photo);

            } catch (error) {
                setErrorMessage('Failed to load user data');
                console.error('Error fetching user data:', error);
            }
        };

        fetchOldData();
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token');
        const data = {
            id: parseInt(id),
            name: fullname,
            phone: phone,
            email: email,
            role: role,
            address: address,
            photo: photo,
            enabled: true
        };

        try {
            const response = await axios.put(
                `${Config.BaseUrl}/update-user`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,  // Menyertakan Bearer token
                    },
                }
            );
    
            console.log(response)
            setSuccessMessage('User updated successfully!');
            window.location.href = '/employees'; // Redirect setelah sukses
        } catch (error) {
            console.error('Error updating user:', error);
            setErrorMessage(error.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Edit Karyawan</h1>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Form Edit Karyawan</h6>
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
                                <div className="mb-3">
                                    <label htmlFor="photo" className="form-label">Photo</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="photo"
                                        name="photo"
                                        value={photo}
                                        onChange={(e) => setPhoto(e.target.value)}
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

export default EmployeesUpdate;
