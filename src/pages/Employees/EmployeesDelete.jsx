import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const EmployeesDelete = () => {
    const { id } = useParams();
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    useEffect(() => {
        const fetchOldData = async () => {
            const token = localStorage.getItem('token');
            const data = {
                id: parseInt(id)
            };

            try {
                const response = await axios.delete(
                    'http://localhost:8989/update-user',
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

        fetchOldData();
    }, [id]);
    return (
        <div>
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
        </div>
    )
}

export default EmployeesDelete