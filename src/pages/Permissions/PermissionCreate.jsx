import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import Config from "../Config";

const PermissionCreate = () => {
    // State untuk form
    const [idPermissionType, setIdPermissionType] = useState("");
    const [note, setNote] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // State untuk tipe izin
    const [permissionTypes, setPermissionTypes] = useState([]);

    // State untuk feedback
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch jenis izin
    useEffect(() => {
        const fetchPermissionTypes = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await axios.get(`${Config.BaseUrl}/permission-types`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPermissionTypes(response.data.data || []);
            } catch (error) {
                console.error("Error fetching permission types:", error);
            }
        };
        fetchPermissionTypes();
    }, []);

    // Submit form
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        if (!startDate || !endDate) {
            setErrorMessage("Harap pilih tanggal mulai dan akhir.");
            setLoading(false);
            return;
        }

        if (endDate < startDate) {
            setErrorMessage("Tanggal akhir tidak boleh lebih kecil dari tanggal mulai.");
            setLoading(false);
            return;
        }

        const payload = {
            id_permission_type: Number(idPermissionType),
            note,
            status: "request",
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
        };

        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${Config.BaseUrl}/create-permission`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccessMessage("Izin berhasil diajukan!");
            console.log(response.data);
            setTimeout(() => {
                window.location.href = "/permissions";
            }, 2000);
        } catch (error) {
            console.error("Error creating permission:", error);
            setErrorMessage(error.response?.data?.message || "Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Ajukan Izin / Cuti</h1>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Form Ajuan Izin / Cuti</h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="permissionType" className="form-label">
                                        Tipe Izin
                                    </label>
                                    <select
                                        className="form-control"
                                        id="permissionType"
                                        value={idPermissionType}
                                        onChange={(e) => setIdPermissionType(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>
                                            -- Pilih Izin --
                                        </option>
                                        {permissionTypes.map((data) => (
                                            <option key={data.id} value={data.id}>
                                                {data.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="note" className="form-label">
                                        Catatan
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="note"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        required
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        selectsStart
                                        startDate={startDate}
                                        endDate={endDate}
                                        placeholderText="Start Date"
                                        dateFormat="yyyy-MM-dd"
                                        className="form-control"
                                    />
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate}
                                        placeholderText="End Date"
                                        dateFormat="yyyy-MM-dd"
                                        className="form-control"
                                    />
                                </div>

                                <div style={{ marginTop: "1rem" }}>
                                    <strong>Durasi Cuti:</strong>{" "}
                                    {startDate && endDate
                                        ? `${Math.floor(
                                              (endDate - startDate) / (1000 * 60 * 60 * 24) + 1
                                        )} hari`
                                        : "Pilih rentang tanggal"}
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
                                <a href="/permissions" className="btn btn-warning ml-3">
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

export default PermissionCreate;
