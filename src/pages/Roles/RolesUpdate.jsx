import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Config from '../Config';

const RolesUpdate = () => {
    const { id } = useParams();

    // Field Input
    const [roleName, setRoleName] = useState('');
    const [superior, setSuperior] = useState('');

    // Roles option
    const [roles, setRoles] = useState([]);

    // Response
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Ambil data roles dari API
    useEffect(() => {
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

    // Mengambil data role berdasarkan id untuk update
    useEffect(() => {
        const fetchOldData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${Config.BaseUrl}/role/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                const data = response.data.data;
                setRoleName(data.name);
                setSuperior(data.id_superior);

            } catch (error) {
                setErrorMessage('Failed to load user data');
                console.error('Error fetching user data:', error);
            }
        };

        fetchOldData();
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token'); // Pastikan token disimpan di localStorage

        const data = {
            id: parseInt(id),
            name: roleName,
            id_superior: superior,
        };

        try {
            const response = await axios.put(
                `${Config.BaseUrl}/update-role`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            setSuccessMessage('Role created successfully!');
            console.log(response.data);
            window.location.href = '/roles';
        } catch (error) {
            console.error('Error creating user:', error);
            setErrorMessage(error.response?.data?.message || 'An error occurred');
        }
    };
    
    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Edit Jabatan</h1>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Form Edit Jabatan</h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="roleName" className="form-label">Nama Jabatan</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="roleName"
                                        name="roleName"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="role" className="form-label">Jabatan Atasan</label>
                                    <select
                                        className="form-control"
                                        id="role"
                                        name="role"
                                        value={superior}
                                        onChange={(e) => setSuperior(parseInt(e.target.value))}
                                        required
                                    >
                                        <option disabled value="">-- Pilih Atasan --</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
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
                                <a href='/roles' className="btn btn-warning">Cancel</a>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RolesUpdate