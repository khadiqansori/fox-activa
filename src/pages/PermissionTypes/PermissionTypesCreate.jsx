import { useState } from 'react';
import axios from 'axios';

function PermissionTypesCreate() {
    // Field Input
    const [permissionName, setPermissionName] = useState('');
    const [isReduceLeave, setIsReduceLeave] = useState(false);

    // Response
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token'); // Pastikan token disimpan di localStorage

        const data = {
            name: permissionName,
            is_reduce_leave: isReduceLeave,
        };

        try {
            const response = await axios.post(
                'http://localhost:8989/create-permission-type',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            setSuccessMessage('Permission type created successfully!');
            console.log(response.data);
            window.location.href = '/permission-types';
        } catch (error) {
            console.error('Error creating permission type:', error);
            setErrorMessage(error.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Tambah Jenis Izin</h1>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Form Tambah Jenis Izin</h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="permissionName" className="form-label">Nama Izin</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="permissionName"
                                        name="permissionName"
                                        value={permissionName}
                                        onChange={(e) => setPermissionName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="isReduceLeave" className="form-label">Kurangi Cuti</label>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="isReduceLeaveTrue"
                                            name="isReduceLeave"
                                            value={true}
                                            checked={isReduceLeave === true}
                                            onChange={() => setIsReduceLeave(true)}
                                        />
                                        <label className="form-check-label" htmlFor="isReduceLeaveTrue">
                                            Ya
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="isReduceLeaveFalse"
                                            name="isReduceLeave"
                                            value={false}
                                            checked={isReduceLeave === false}
                                            onChange={() => setIsReduceLeave(false)}
                                        />
                                        <label className="form-check-label" htmlFor="isReduceLeaveFalse">
                                            Tidak
                                        </label>
                                    </div>
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

                                <button type="submit" className="btn btn-primary">Submit</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PermissionTypesCreate;