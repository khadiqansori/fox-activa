import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Config from "../Config";

const ExternalAssesmentsCreate = () => {
    const [percentage, setPercentage] = useState("");
    const [reasons, setReasons] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const { id, date } = useParams();
    const token = localStorage.getItem("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        // Validasi persentase tidak boleh 0
        if (parseInt(percentage) <= 0) {
            setErrorMessage("Persentase harus lebih besar dari 0.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${Config.BaseUrl}/create-external-assessments`,
                {
                    date: date,
                    id_user: parseInt(id),
                    reasons: reasons,
                    percentage: parseInt(percentage),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                setSuccessMessage("Data berhasil disimpan.");
                setPercentage("");
                setReasons("");
                setTimeout(() => {
                    window.location.href = "/external-assesments";
                }, 2000);
            }
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Terjadi kesalahan saat mengirim data."
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePercentageChange = (e) => {
        const value = e.target.value;
        if (parseInt(value) < 0) {
            setErrorMessage("Persentase tidak boleh kurang dari 0.");
        } else {
            setErrorMessage(null); // Hilangkan pesan error jika valid
        }
        setPercentage(value);
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Input External Assessment</h1>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">
                                Form Input External Assessment
                            </h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="percentage" className="form-label">
                                        Persentase
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="percentage"
                                        value={percentage}
                                        onChange={handlePercentageChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="reasons" className="form-label">
                                        Alasan
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="reasons"
                                        value={reasons}
                                        onChange={(e) => setReasons(e.target.value)}
                                        required
                                    />
                                </div>
                                {errorMessage && (
                                    <div className="alert alert-danger mt-3">{errorMessage}</div>
                                )}
                                {successMessage && (
                                    <div className="alert alert-success mt-3">{successMessage}</div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? "Mengirim..." : "Submit"}
                                </button>
                                <a href="/external-assesments" className="btn btn-warning ml-3">
                                    Cancel
                                </a>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExternalAssesmentsCreate;
