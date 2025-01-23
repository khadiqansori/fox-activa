import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Config from '../Config';

function TaskManagementEdit() {
    const { id } = useParams();
    
    // State untuk field input
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignTo, setAssignTo] = useState('');
    const [assignName, setAssignName] = useState('');
    const [status, setStatus] = useState('open');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');

    // State untuk data pengguna
    const [users, setUsers] = useState([]);

    // State untuk pesan respons
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const userInfo = JSON.parse(localStorage.getItem('user_info'));

    // Fetch data pengguna dan tugas saat komponen di-mount
    useEffect(() => {
        const fetchTaskAndUsers = async () => {
            const token = localStorage.getItem('token'); // Token API

            try {
                // Fetch pengguna
                const usersResponse = await axios.get(`${Config.BaseUrl}/users/hierarchy`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                setUsers(usersResponse.data.data || []);

                // Fetch tugas berdasarkan id
                const taskResponse = await axios.get(`${Config.BaseUrl}/tasks`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    params: {
                        "id.eq": id,
                    }
                });

                const task = taskResponse.data.data[0];

                // Set data tugas ke state
                setTitle(task.title || '');
                setDescription(task.description || '');
                setAssignTo(task.assign_to || '');
                setAssignName(task.assign_name || '');
                setStatus(task.status || 'open');
                setPriority(task.priority || 'medium');
                setDueDate(task.due_date || '');
            } catch (error) {
                console.error('Error fetching task or users:', error);
                setErrorMessage('Gagal memuat data.');
            }
        };

        fetchTaskAndUsers();
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token'); // Ambil token dari localStorage

        const data = {
            id: parseInt(id), // ID tugas yang sedang diedit
            title: title,
            description: description,
            assign_to: Number(assignTo),
            assign_name: assignName,
            status: status,
            priority: priority,
            due_date: dueDate,
        };

        try {
            const response = await axios.put(
                `${Config.BaseUrl}/update-task`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            setSuccessMessage('Task updated successfully!');
            console.log(response.data);
            // Redirect ke halaman daftar tugas
            window.location.href = '/task-management';
        } catch (error) {
            console.error('Error updating task:', error);
            setErrorMessage(error.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Edit Tugas</h1>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Form Edit Tugas</h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Judul Tugas</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Deskripsi</label>
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        rows="3"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="assignTo" className="form-label">Pilih Penerima</label>
                                    <select
                                        className="form-control"
                                        id="assignTo"
                                        value={assignTo}
                                        onChange={(e) => {
                                            const selectedUser = users.find(user => user.id === Number(e.target.value));
                                            setAssignTo(e.target.value);
                                            setAssignName(selectedUser?.name || '');
                                        }}
                                        required
                                    >
                                        <option value="" disabled>-- Pilih Penerima --</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="status" className="form-label">Status</label>
                                    <select
                                        className="form-control"
                                        id="status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="in_review">In Review</option>
                                        <option value="completed" disabled={!userInfo.role.includes('spv')}>Completed</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="priority" className="form-label">Prioritas</label>
                                    <select
                                        className="form-control"
                                        id="priority"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="dueDate" className="form-label">Tanggal Tenggat</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="dueDate"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        required
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
                                <a href='/task-management' className="btn btn-warning">Cancel</a>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskManagementEdit;
