import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import "./Dashboard.css";

const API = "https://srm-server-cyan.vercel.app"

export function Dashboard() {

    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editRoll, setEditRoll] = useState(null);
    const [studentmodal, setstudentmodal] = useState(false);
    const [selectedStudent, setselectedStudent] = useState(null);
    const [addloding, setaddloding] = useState(false)

    const [form, setForm] = useState({
        name: "",
        age: "",
        course: "",
        mobile: "",
        roll_no: "",
        user_photo: null
    });

    const [error, setError] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const token = sessionStorage.getItem("SRM_Token");

    // FETCH STUDENTS
    const loadStudents = () => {

        fetch(`${API}/users`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setStudents(
                    Array.isArray(data) ? data :
                        data.users || data.students || []
                );
            })
            .catch(err => setError(err.message));

    };

    useEffect(() => {

        if (!token) {
            navigate("/");
        } else {
            loadStudents();
        }

    }, []);

    // FORM INPUT
    const handleChange = (e) => {

        const { name, value, files } = e.target;

        setForm({
            ...form,
            [name]: files ? files[0] : value
        });

    };

    // OPEN ADD FORM
    const openAddForm = () => {

        setEditRoll(null);

        setForm({
            name: "",
            age: "",
            course: "",
            mobile: "",
            roll_no: "",
            user_photo: null
        });

        setShowForm(true);

    };

    // OPEN EDIT FORM
    const openEditForm = (student) => {

        setEditRoll(student.roll_no);

        setForm({
            name: student.name || "",
            age: student.age || "",
            course: student.course || "",
            mobile: student.mobile || "",
            roll_no: student.roll_no || "",
            user_photo: null
        });

        setShowForm(true);

    };

    // ADD OR UPDATE STUDENT
    const handleSubmit = (e) => {




        e.preventDefault();
        setaddloding(true)

        const formData = new FormData();

        formData.append("name", form.name);
        formData.append("age", form.age);
        formData.append("course", form.course);
        formData.append("mobile", form.mobile);
        formData.append("roll_no", form.roll_no);

        if (form.user_photo) {
            formData.append("user_photo", form.user_photo);
        }

        const url = editRoll
            ? `${API}/edit/${encodeURIComponent(editRoll)}`
            : `${API}/addUser`;

        const method = editRoll ? "PATCH" : "POST";

        fetch(url, {
            method: method,
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        })
            .then(res => res.json())
            .then(data => {

                if (data.success === false) {
                    setError(data.message || "Operation failed");
                    return;
                }

                setError("");
                setShowForm(false);
                loadStudents();

            })
            .catch(err => setError(err.message))
            .finally(() => {
              setaddloding(false);
             });
};

// DELETE STUDENT
const deleteStudent = (roll_no) => {

    if (!window.confirm("Are you sure you want to delete this student?")) {
        return;
    }

    fetch(`${API}/delete/${encodeURIComponent(roll_no)}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(() => loadStudents())
        .catch(err => setError(err.message));

};

// SEARCH STUDENTS
const filteredStudents = students.filter(student =>

    student.name?.toLowerCase().includes(search.toLowerCase()) ||
    student.course?.toLowerCase().includes(search.toLowerCase()) ||
    String(student.roll_no || "").toLowerCase().includes(search.toLowerCase()) ||
    String(student.mobile || "").includes(search)

);

// COURSE COUNT
const totalCourses = [...new Set(
    students.map(student => student.course).filter(Boolean)
)].length;

return (

    <div className="dashboard-layout">

        <Sidebar className="dashboard-sidebar" isOpen={isOpen} onClose={() => setIsOpen(false)} />
        <main className="dashboard-main">

            <button
                className="hamburger"
                onClick={() => setIsOpen(true)}
            >
                ☰
            </button>

            <div className="dashboard-page">

                {/* TOP HEADER */}
                <header className="dashboard-topbar">
                    <div>
                        <p>Pages / Dashboard</p>
                        <h1>Student Dashboard</h1>
                    </div>

                    <button
                        className="dashboard-analysis-btn"
                        onClick={() => navigate("/Analysis")}
                    >
                        View Analysis
                    </button>
                </header>

                {/* WELCOME */}
                <section className="dashboard-welcome">
                    <div>
                        <h2>Welcome Back, Administrator!</h2>
                        <p>Manage your students from one place.</p>
                    </div>

                    <button
                        className="dashboard-add-btn"
                        onClick={openAddForm}
                    >
                        + Add Student
                    </button>
                </section>

                {/* STATISTICS */}
                <section className="dashboard-stats">

                    <div className="dashboard-stat-card">
                        <span>Total Students</span>
                        <h2>{students.length}</h2>
                        <small>Registered students</small>
                    </div>

                    <div className="dashboard-stat-card">
                        <span>Total Courses</span>
                        <h2>{totalCourses}</h2>
                        <small>Available courses</small>
                    </div>

                </section>

                {/* STUDENT TABLE */}
                <section className="dashboard-student-section">

                    <div className="dashboard-section-header">
                        <div>
                            <h2>Student Records</h2>
                            <p>View and manage student details</p>
                        </div>

                        <input
                            type="text"
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="dashboard-search"
                        />
                    </div>

                    {error && (
                        <p className="dashboard-error">{error}</p>
                    )}

                    <div className="dashboard-table-wrapper">

                        <table className="dashboard-table">

                            <thead>
                                <tr>
                                    <th>Photo</th>
                                    <th>Name</th>
                                    <th>Roll No</th>
                                    <th>Age</th>
                                    <th>Course</th>
                                    <th>Mobile</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredStudents.length === 0 ? (

                                    <tr>
                                        <td colSpan="7" className="dashboard-empty">
                                            No student records found.
                                        </td>
                                    </tr>

                                ) : (

                                    filteredStudents.map(student => (

                                        <tr
                                            key={student.roll_no}
                                            onClick={() => {
                                                setselectedStudent(student);
                                                setstudentmodal(true);
                                            }}
                                        >
                                            <td>
                                                {student.photo ? (
                                                    <img
                                                        src={student.photo}
                                                        alt="Student"
                                                        className="dashboard-student-photo"
                                                    />
                                                ) : (
                                                    <div className="dashboard-no-photo">
                                                        {student.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </td>

                                            <td>{student.name}</td>
                                            <td>{student.roll_no}</td>
                                            <td>{student.age}</td>
                                            <td>{student.course}</td>
                                            <td>{student.mobile}</td>

                                            <td>
                                                <button
                                                    className="dashboard-edit-btn"
                                                    onClick={(e) => {
                                                        openEditForm(student)
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="dashboard-delete-btn"
                                                    onClick={(e) => {
                                                        deleteStudent(student.roll_no)
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

                {/* FOOTER */}
                <footer className="dashboard-footer">
                    © 2026 SRM Student Management System
                </footer>
            </div>
        </main>



        {/* ADD / EDIT MODAL */}
        {showForm && (

            <div className="dashboard-modal-overlay">

                <div className="dashboard-modal">

                    <div className="dashboard-modal-header">
                        <h2>{editRoll ? "Edit Student" : "Add Student"}</h2>

                        <button onClick={() => setShowForm(false)}>
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <label>Student Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                        <label>Roll Number</label>
                        <input
                            type="text"
                            name="roll_no"
                            value={form.roll_no}
                            onChange={handleChange}
                            required
                            disabled={!!editRoll}
                        />

                        <label>Age</label>
                        <input
                            type="number"
                            name="age"
                            value={form.age}
                            onChange={handleChange}
                            required
                        />

                        <label>Course</label>
                        <input
                            type="text"
                            name="course"
                            value={form.course}
                            onChange={handleChange}
                            required
                        />

                        <label>Mobile</label>
                        <input
                            type="text"
                            name="mobile"
                            value={form.mobile}
                            onChange={handleChange}
                            required
                        />

                        <label>Student Photo</label>
                        <input
                            type="file"
                            name="user_photo"
                            accept="image/*"
                            onChange={handleChange}
                        />

                        <button
                            type="submit"
                            className="dashboard-save-btn"
                            disabled={addloding}
                        >
                            {addloding ? (editRoll ? "Updating Student..." : "Adding Student...") : (editRoll ? "Update Student" : "Add Student")
                            }
                        </button>

                    </form>

                </div>

            </div>


        )}
        {studentmodal && selectedStudent && (
            <div className="student-overlay" onClick={() => setstudentmodal(false)}>

                <div className="student-modal" onClick={(e) => e.stopPropagation()}>

                    <button className="modal-close" onClick={() => setstudentmodal(false)}>
                        ×
                    </button>

                    {/* LEFT SIDE */}
                    <div className="student-profile">

                        <img
                            src={`${selectedStudent.photo}`}
                            alt="Student"
                        />

                        <h2>{selectedStudent.name}</h2>
                        <p>{selectedStudent.course}</p>

                        <span className="student-badge">
                            Roll No: {selectedStudent.roll_no}
                        </span>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="student-details">

                        <h2>Student Information</h2>
                        <p className="details-subtitle">Complete student profile details</p>

                        <div className="details-grid">

                            <div className="detail-box">
                                <label>Full Name</label>
                                <h3>{selectedStudent.name}</h3>
                            </div>

                            <div className="detail-box">
                                <label>Roll Number</label>
                                <h3>{selectedStudent.roll_no}</h3>
                            </div>

                            <div className="detail-box">
                                <label>Age</label>
                                <h3>{selectedStudent.age} Years</h3>
                            </div>

                            <div className="detail-box">
                                <label>Course</label>
                                <h3>{selectedStudent.course}</h3>
                            </div>

                            <div className="detail-box">
                                <label>Mobile Number</label>
                                <h3>{selectedStudent.mobile}</h3>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        )}

    </div>

);
}