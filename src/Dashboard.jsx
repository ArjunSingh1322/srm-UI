
import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import "./Dashboard.css";

const API_URL = "https://srm-server-cyan.vercel.app";

export const Dashboard = () => {

    const token = sessionStorage.getItem("SRM_Token");

    // Main states
    const [students, setStudents] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 5;

    const [loading, setLoading] = useState(false);
    const [pageError, setPageError] = useState("");

    // Student add/edit modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Student form
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [course, setCourse] = useState("");
    const [mobile, setMobile] = useState("");
    const [roll_no, setRollNo] = useState("");
    const [photo, setPhoto] = useState(null);

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Student details modal
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailStudent, setDetailStudent] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);

    // Performance modal
    const [performanceOpen, setPerformanceOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [performanceErrors, setPerformanceErrors] = useState({});
    const [performanceLoading, setPerformanceLoading] = useState(false);


    const emptyPerformance = {
        technical_skills: "",
        problem_solving: "",
        communication: "",
        discipline: "",
        participation: "",
        task_completion: "",
        remarks: ""
    };

    const [performance, setPerformance] = useState(emptyPerformance);

    // Analytics filters
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");

    // Export dates
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [exportLoading, setExportLoading] = useState(false);


    // =====================================
    // COMMON API HELPER
    // =====================================

    async function apiRequest(url, options = {}) {

        const response = await fetch(`${API_URL}${url}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(options.body instanceof FormData
                    ? {}
                    : { "Content-Type": "application/json" }),
                ...options.headers
            }
        });

        let data;

        if (options.download) {
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Download failed");
            }

            return response.blob();
        }

        const text = await response.text();

        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = { message: text };
        }

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        return data;
    }


    // =====================================
    // GET ALL STUDENTS
    // =====================================

    async function getStudents() {

        setLoading(true);
        setPageError("");

        try {

            const data = await apiRequest("/users");

            const list = Array.isArray(data) ? data : data.data || [];

            setStudents(list);

        } catch (error) {

            setPageError(error.message);
            console.log(error);

        } finally {

            setLoading(false);

        }

    }


    useEffect(() => {
        getStudents();
    }, []);


    // =====================================
    // STUDENT PHOTO URL
    // =====================================

    function getPhotoUrl(path) {

        if (!path) return null;

        // If Cloudinary URL is already available
        if (path.startsWith("http")) {
            return path;
        }

        // For older server-side image paths
        const cleanPath = path
            .replace(/\\/g, "/")
            .replace(/^\.?\//, "");

        return `${API_URL}/${cleanPath}`;
    }


    // =====================================
    // SEARCH AND PAGINATION
    // =====================================

    const filteredStudents = students.filter((item) => {

        const studentName = String(item.name || "").toLowerCase();
        const studentRoll = String(item.roll_no || "").toLowerCase();
        const studentCourse = String(item.course || "").toLowerCase();

        const value = search.toLowerCase();

        return (
            studentName.includes(value) ||
            studentRoll.includes(value) ||
            studentCourse.includes(value)
        );

    });


    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

    const lastIndex = currentPage * studentsPerPage;
    const firstIndex = lastIndex - studentsPerPage;

    const currentStudents = filteredStudents.slice(firstIndex, lastIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);


    useEffect(() => {

        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }

    }, [totalPages, currentPage]);


    // =====================================
    // COURSE ANALYTICS
    // =====================================

    const courseData = [];

    students.forEach((item) => {

        const courseName = item.course || "Other";

        const found = courseData.find(
            (courseItem) => courseItem.name === courseName
        );

        if (found) {
            found.count++;
        } else {
            courseData.push({
                name: courseName,
                count: 1
            });
        }

    });


    // =====================================
    // STUDENT ADD / EDIT MODAL
    // =====================================

    function openAddModal() {

        setSelectedStudent(null);

        setName("");
        setAge("");
        setCourse("");
        setMobile("");
        setRollNo("");
        setPhoto(null);

        setErrors({});
        setModalOpen(true);

    }


    function openEditModal(item) {

        setSelectedStudent(item);

        setName(item.name || "");
        setAge(item.age || "");
        setCourse(item.course || "");
        setMobile(String(item.mobile ?? ""));
        setRollNo(String(item.roll_no ?? ""));
        setPhoto(null);

        setErrors({});
        setModalOpen(true);

    }


    function closeStudentModal() {

        setModalOpen(false);
        setSelectedStudent(null);
        setPhoto(null);
        setErrors({});

    }


    // =====================================
    // STUDENT VALIDATION
    // =====================================

    function validateStudent() {

        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = "Student name is required";
        }

        if (!age) {
            newErrors.age = "Age is required";
        } else if (
            !Number.isInteger(Number(age)) ||
            Number(age) < 1 ||
            Number(age) > 120
        ) {
            newErrors.age = "Age must be between 1 and 120";
        }

        if (!course.trim()) {
            newErrors.course = "Course is required";
        }

        if (!mobile.trim()) {
            newErrors.mobile = "Mobile number is required";
        } else if (!/^\d{10}$/.test(mobile.trim())) {
            newErrors.mobile = "Enter a valid 10 digit mobile number";
        }

        const rollValue = String(roll_no).trim();

        if (!rollValue) {
            newErrors.roll_no = "Roll number is required";
        }

        if (!selectedStudent && !photo) {
            newErrors.photo = "Student photo is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;

    }


    // =====================================
    // ADD / UPDATE STUDENT
    // =====================================

    async function saveStudent(e) {

        e.preventDefault();

        if (!validateStudent()) return;

        const formData = new FormData();

        formData.append("name", name.trim());
        formData.append("age", age);
        formData.append("course", course.trim());
        formData.append("mobile", mobile.trim());
        formData.append("roll_no", roll_no.trim());

        if (photo) {
            formData.append("user_photo", photo);
        }

        let url = "/addUser";
        let method = "POST";

        if (selectedStudent) {
            url = `/edit/${encodeURIComponent(selectedStudent.roll_no)}`;
            method = "PATCH";
        }

        setSaving(true);

        try {

            await apiRequest(url, {
                method,
                body: formData
            });

            await getStudents();

            closeStudentModal();

        } catch (error) {

            setErrors({ server: error.message });

        } finally {

            setSaving(false);

        }

    }


    // =====================================
    // DELETE STUDENT
    // =====================================

    async function deleteStudent(item) {

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${item.name}?`
        );

        if (!confirmDelete) return;

        try {

            await apiRequest(
                `/delete/${encodeURIComponent(item.roll_no)}`,
                { method: "DELETE" }
            );

            setStudents((oldStudents) =>
                oldStudents.filter(
                    (student) => student.id !== item.id
                )
            );

            if (detailStudent?.id === item.id) {
                closeDetailsModal();
            }

        } catch (error) {

            alert(error.message);

        }

    }


    // =====================================
    // DATE-WISE ANALYTICS
    // =====================================

    async function applyAnalytics() {

        const params = new URLSearchParams();

        if (year) params.append("year", year);
        if (month) params.append("month", month);
        if (day) params.append("day", day);

        try {

            setLoading(true);

            const response = await fetch(
                `${API_URL}/analytics?${params.toString()}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Analytics failed");
            }

            setStudents(data.data || []);
            setCurrentPage(1);

        } catch (error) {

            setPageError(error.message);

        } finally {

            setLoading(false);

        }

    }


    // =====================================
    // RESET ANALYTICS
    // =====================================

    function resetAnalytics() {

        setYear("");
        setMonth("");
        setDay("");

        getStudents();

    }


    // =====================================
    // EXPORT EXCEL
    // =====================================

    async function exportStudents() {

        if (!startDate || !endDate) {
            alert("Please select both start date and end date");
            return;
        }

        if (startDate > endDate) {
            alert("Start date must be before end date");
            return;
        }

        setExportLoading(true);

        try {

            const blob = await apiRequest(
                `/export-students?startDate=${startDate}&endDate=${endDate}`,
                {
                    method: "GET",
                    download: true
                }
            );

            const fileUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = `students_${startDate}_to_${endDate}.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(fileUrl);

        } catch (error) {

            alert(error.message);

        } finally {

            setExportLoading(false);

        }

    }


    // =====================================
    // OPEN STUDENT DETAILS
    // =====================================

    async function openStudentDetails(item) {

        setDetailStudent(item);
        setDetailsOpen(true);
        setReviews([]);
        setReviewLoading(true);

        try {

            const data = await apiRequest(
                `/student-performance/${item.id}`
            );

            setReviews(data.performance || []);

        } catch (error) {

            console.log(error);

        } finally {

            setReviewLoading(false);

        }

    }


    function closeDetailsModal() {

        setDetailsOpen(false);
        setDetailStudent(null);
        setReviews([]);
        setPerformanceOpen(false);
        setEditingReview(null);

    }


    // =====================================
    // PERFORMANCE FORM
    // =====================================

    function openPerformanceModal(review = null) {

        setEditingReview(review);

        if (review) {

            setPerformance({
                technical_skills: review.technical_skills,
                problem_solving: review.problem_solving,
                communication: review.communication,
                discipline: review.discipline,
                participation: review.participation,
                task_completion: review.task_completion,
                remarks: review.remarks || ""
            });

        } else {

            setPerformance(emptyPerformance);

        }

        setPerformanceErrors({});
        setPerformanceOpen(true);

    }


    function closePerformanceModal() {

        setPerformanceOpen(false);
        setEditingReview(null);
        setPerformance(emptyPerformance);
        setPerformanceErrors({});

    }


    function updatePerformance(field, value) {

        setPerformance((old) => ({
            ...old,
            [field]: value
        }));

    }


    // =====================================
    // PERFORMANCE VALIDATION
    // =====================================

    function validatePerformance() {

        const newErrors = {};

        const fields = [
            "technical_skills",
            "problem_solving",
            "communication",
            "discipline",
            "participation",
            "task_completion"
        ];

        fields.forEach((field) => {

            const value = performance[field];

            if (value === "") {
                newErrors[field] = "Required";
            } else if (
                !Number.isInteger(Number(value)) ||
                Number(value) < 0 ||
                Number(value) > 10
            ) {
                newErrors[field] = "Enter marks from 0 to 10";
            }

        });

        setPerformanceErrors(newErrors);

        return Object.keys(newErrors).length === 0;

    }


    // =====================================
    // SAVE PERFORMANCE
    // =====================================

    async function savePerformance(e) {

        e.preventDefault();

        if (!validatePerformance()) return;

        const body = {
            technical_skills: Number(performance.technical_skills),
            problem_solving: Number(performance.problem_solving),
            communication: Number(performance.communication),
            discipline: Number(performance.discipline),
            participation: Number(performance.participation),
            task_completion: Number(performance.task_completion),
            remarks: performance.remarks
        };

        setPerformanceLoading(true);

        try {

            let url = `/student-performance/${detailStudent.id}`;
            let method = "POST";

            if (editingReview) {
                url = `/student-performance/${editingReview.id}`;
                method = "PUT";
            }

            await apiRequest(url, {
                method,
                body: JSON.stringify(body)
            });

            const data = await apiRequest(
                `/student-performance/${detailStudent.id}`
            );

            setReviews(data.performance || []);

            closePerformanceModal();

        } catch (error) {

            setPerformanceErrors({
                server: error.message
            });

        } finally {

            setPerformanceLoading(false);

        }

    }

    // =====================================
    // DELETE PERFORMANCE REVIEW
    // =====================================

    async function deletePerformance(review) {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this review?"
        );

        if (!confirmDelete) return;

        try {

            await apiRequest(
                `/student-performance/${review.id}`,
                { method: "DELETE" }
            );

            setReviews((old) =>
                old.filter((item) => item.id !== review.id)
            );

        } catch (error) {

            alert(error.message);

        }

    }


    // =====================================
    // PERFORMANCE SUMMARY
    // =====================================

    function getRatingClass(rating) {

        if (rating === "Excellent") return "rating-excellent";
        if (rating === "Very Good") return "rating-very-good";
        if (rating === "Good") return "rating-good";
        if (rating === "Average") return "rating-average";

        return "rating-low";

    }


    function getLatestReview(item) {

        if (detailStudent?.id === item.id && reviews.length > 0) {
            return reviews[0];
        }

        return null;

    }


    // =====================================
    // RENDER
    // =====================================

    return (

        <div className="wraper">

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <main className="dash-wraper">

                {/* HEADER */}

                <div className="dash-header">

                    <div className="dash-icon">
                        <p className="welcome-text">Student Management System</p>
                        <h1>Dashboard</h1>
                    </div>
                    <div className="ham-add"> 
                        <button
                        className="hamburger"
                        onClick={() => setSidebarOpen(true)}
                    >
                        ☰
                    </button>

                    <button
                        className="add-student-btn"
                        onClick={openAddModal}
                    >
                        + Add Student
                    </button></div>
                   

                </div>


                {/* STATISTICS */}

                <div className="stats-grid">

                    <div className="stat-card">
                        <p>Total Students</p>
                        <h2>{students.length}</h2>
                        <span className="stat-description">
                            Registered students
                        </span>
                    </div>

                    <div className="stat-card">
                        <p>Total Courses</p>
                        <h2>{courseData.length}</h2>
                        <span className="stat-description">
                            Active course groups
                        </span>
                    </div>

                </div>


                {/* COURSE GRAPH */}

                <div className="graph-card">

                    <div className="section-heading">
                        <div>
                            <h3>Students by Course</h3>
                            <p>Course-wise student distribution</p>
                        </div>
                    </div>

                    {courseData.length > 0 ? (

                        <div className="course-graph">

                            {courseData.map((item) => (

                                <div className="course-bar-row" key={item.name}>

                                    <span className="course-name">
                                        {item.name}
                                    </span>

                                    <div className="course-bar-bg">

                                        <div
                                            className="course-bar"
                                            style={{
                                                width: `${(item.count / students.length) * 100}%`
                                            }}
                                        />

                                    </div>

                                    <span className="course-count">
                                        {item.count}
                                    </span>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <p className="empty-text">No course data available</p>

                    )}

                </div>


                {/* ANALYTICS FILTER */}

                <div className="analytics-card">

                    <div className="section-heading">
                        <div>
                            <h3>Date-wise Analytics</h3>
                            <p>Filter students by registration date</p>
                        </div>
                    </div>

                    <div className="analytics-filters">

                        <input
                            type="number"
                            placeholder="Year e.g. 2026"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        />

                        <input
                            type="number"
                            placeholder="Month 1-12"
                            min="1"
                            max="12"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                        />

                        <input
                            type="number"
                            placeholder="Day 1-31"
                            min="1"
                            max="31"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                        />

                        <button onClick={applyAnalytics}>
                            Apply Filter
                        </button>

                        <button
                            className="secondary-btn"
                            onClick={resetAnalytics}
                        >
                            Reset
                        </button>

                    </div>

                </div>


                {/* EXCEL EXPORT */}

                <div className="export-card">
                    <div>
                        <h3>Export Students</h3>
                        <p>Download student records in Excel format</p>
                    </div>

                    <div className="export-controls">

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />

                        <button
                            onClick={exportStudents}
                            disabled={exportLoading}
                        >
                            {exportLoading ? "Exporting..." : "Export Excel"}
                        </button>

                    </div>

                </div>


                {/* STUDENT TABLE */}

                <div className="student-table-card">

                    <div className="student-table-header">

                        <div>
                            <h3>All Students</h3>
                            <p>{filteredStudents.length} students found</p>
                        </div>

                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search name, roll no or course..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                    </div>


                    {pageError && (
                        <div className="page-error">{pageError}</div>
                    )}


                    {loading ? (

                        <p className="empty-text">Loading students...</p>

                    ) : (

                        <div className="table-scroll">

                            <table className="student-table">

                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Roll Number</th>
                                        <th>Course</th>
                                        <th>Age</th>
                                        <th>Mobile</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {currentStudents.length > 0 ? (

                                        currentStudents.map((item) => (

                                            <tr key={item.id}>

                                                <td
                                                    onClick={() => openStudentDetails(item)}
                                                    className="clickable-cell"
                                                >

                                                    <div className="student-info">

                                                        {item.photo ? (
                                                            <img
                                                                src={getPhotoUrl(item.photo)}
                                                                alt={item.name}
                                                                className="student-photo"
                                                            />
                                                        ) : (
                                                            <div className="student-avatar">
                                                                {item.name?.charAt(0)?.toUpperCase()}
                                                            </div>
                                                        )}

                                                        <div>
                                                            <strong className="student-name">
                                                                {item.name}
                                                            </strong>

                                                            <span className="student-subtitle">
                                                                View student profile
                                                            </span>
                                                        </div>

                                                    </div>

                                                </td>

                                                <td>{item.roll_no}</td>
                                                <td>{item.course}</td>
                                                <td>{item.age}</td>
                                                <td>{item.mobile}</td>

                                                <td>
                                                    {item.created_at
                                                        ? new Date(item.created_at).toLocaleDateString()
                                                        : "-"}
                                                </td>

                                                <td>

                                                    <div className="student-actions">

                                                        <button
                                                            className="edit-btn"
                                                            title="Edit student"
                                                            onClick={() => openEditModal(item)}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="delete-btn"
                                                            title="Delete student"
                                                            onClick={() => deleteStudent(item)}
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))

                                    ) : (

                                        <tr>
                                            <td colSpan="7" className="empty-text">
                                                No students found
                                            </td>
                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}


                    {/* PAGINATION */}

                    <div className="pagination">

                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Previous
                        </button>

                        {Array.from(
                            { length: totalPages },
                            (_, index) => (

                                <button
                                    key={index}
                                    className={
                                        currentPage === index + 1 ? "active" : ""
                                    }
                                    onClick={() => setCurrentPage(index + 1)}
                                >
                                    {index + 1}
                                </button>

                            )
                        )}

                        <button
                            disabled={
                                currentPage === totalPages || totalPages === 0
                            }
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Next
                        </button>

                    </div>

                </div>

            </main>


            {/* =====================================
                ADD / EDIT STUDENT MODAL
            ===================================== */}

            {modalOpen && (

                <div
                    className="student-modal-overlay"
                    onClick={closeStudentModal}
                >

                    <div
                        className="student-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="student-modal-header">

                            <h2>
                                {selectedStudent ? "Edit Student" : "Add Student"}
                            </h2>

                            <button
                                className="modal-close-btn"
                                type="button"
                                onClick={closeStudentModal}
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={saveStudent}>

                            <div className="student-modal-body">

                                <div className="modal-form-grid">

                                    <div className="modal-form-group">
                                        <label>Student Name *</label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter student name"
                                        />
                                        {errors.name && <small>{errors.name}</small>}
                                    </div>

                                    <div className="modal-form-group">
                                        <label>Age *</label>
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            placeholder="Enter age"
                                        />
                                        {errors.age && <small>{errors.age}</small>}
                                    </div>

                                    <div className="modal-form-group">
                                        <label>Course *</label>
                                        <input
                                            value={course}
                                            onChange={(e) => setCourse(e.target.value)}
                                            placeholder="Enter course"
                                        />
                                        {errors.course && <small>{errors.course}</small>}
                                    </div>

                                    <div className="modal-form-group">
                                        <label>Mobile Number *</label>
                                        <input
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            placeholder="Enter mobile number"
                                        />
                                        {errors.mobile && <small>{errors.mobile}</small>}
                                    </div>

                                    <div className="modal-form-group">
                                        <label>Roll Number *</label>
                                        <input
                                            value={roll_no}
                                            onChange={(e) => setRollNo(e.target.value)}
                                            placeholder="Enter roll number"
                                        />
                                        {errors.roll_no && <small>{errors.roll_no}</small>}
                                    </div>

                                    <div className="modal-form-group">
                                        <label>
                                            Student Photo {selectedStudent ? "(Optional)" : "*"}
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setPhoto(e.target.files[0] || null)}
                                        />
                                        {errors.photo && <small>{errors.photo}</small>}
                                    </div>

                                </div>


                                {selectedStudent?.photo && (

                                    <div className="existing-photo">

                                        <img
                                            src={getPhotoUrl(selectedStudent.photo)}
                                            alt="Current student"
                                        />

                                        <span>
                                            Current photo. Upload a new one to replace it.
                                        </span>

                                    </div>

                                )}

                                {photo && (
                                    <p className="selected-photo">
                                        Selected: {photo.name}
                                    </p>
                                )}

                                {errors.server && (
                                    <div className="modal-server-error">
                                        {errors.server}
                                    </div>
                                )}

                            </div>


                            <div className="student-modal-footer">

                                <button
                                    type="button"
                                    className="modal-cancel-btn"
                                    onClick={closeStudentModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="modal-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : selectedStudent
                                            ? "Update Student"
                                            : "Save Student"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================
                STUDENT DETAILS MODAL
            ===================================== */}

            {detailsOpen && detailStudent && (

                <div
                    className="student-modal-overlay"
                    onClick={closeDetailsModal}
                >

                    <div
                        className="details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="student-modal-header">

                            <h2>Student Profile</h2>

                            <button
                                className="modal-close-btn"
                                onClick={closeDetailsModal}
                            >
                                ×
                            </button>

                        </div>


                        <div className="details-content">

                            <div className="details-profile">

                                {detailStudent.photo ? (
                                    <img
                                        src={getPhotoUrl(detailStudent.photo)}
                                        alt={detailStudent.name}
                                        className="details-photo"
                                    />
                                ) : (
                                    <div className="details-avatar">
                                        {detailStudent.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}

                                <div>
                                    <h2>{detailStudent.name}</h2>
                                    <p>Roll Number: {detailStudent.roll_no}</p>
                                    <p>{detailStudent.course}</p>
                                </div>

                            </div>


                            <div className="details-grid">

                                <div className="detail-item">
                                    <span>Student ID</span>
                                    <strong>{detailStudent.id}</strong>
                                </div>

                                <div className="detail-item">
                                    <span>Age</span>
                                    <strong>{detailStudent.age}</strong>
                                </div>

                                <div className="detail-item">
                                    <span>Mobile</span>
                                    <strong>{detailStudent.mobile}</strong>
                                </div>

                                <div className="detail-item">
                                    <span>Course</span>
                                    <strong>{detailStudent.course}</strong>
                                </div>

                                <div className="detail-item">
                                    <span>Roll Number</span>
                                    <strong>{detailStudent.roll_no}</strong>
                                </div>

                                <div className="detail-item">
                                    <span>Joined Date</span>
                                    <strong>
                                        {detailStudent.created_at
                                            ? new Date(detailStudent.created_at).toLocaleDateString()
                                            : "-"}
                                    </strong>
                                </div>

                            </div>


                            {/* PERFORMANCE HISTORY */}

                            <div className="performance-section">

                                <div className="performance-header">

                                    <div>
                                        <h3>Student Performance</h3>
                                        <p>Review history and ratings</p>
                                    </div>

                                    <button
                                        className="add-performance-btn"
                                        onClick={() => openPerformanceModal()}
                                    >
                                        + Add Review
                                    </button>

                                </div>


                                {reviewLoading ? (

                                    <p className="empty-text">
                                        Loading performance...
                                    </p>

                                ) : reviews.length > 0 ? (

                                    <div className="review-list">

                                        {reviews.map((review) => (

                                            <div className="review-card" key={review.id}>

                                                <div className="review-card-top">

                                                    <div>
                                                        <span className="review-date">
                                                            {review.created_at
                                                                ? new Date(review.created_at).toLocaleDateString()
                                                                : "Review"}
                                                        </span>

                                                        <h4>
                                                            {review.overall_rating}
                                                        </h4>
                                                    </div>

                                                    <span className={`rating-badge ${getRatingClass(review.overall_rating)}`}>
                                                        {Number(review.percentage).toFixed(2)}%
                                                    </span>

                                                </div>


                                                <div className="review-progress">
                                                    <div
                                                        className="review-progress-fill"
                                                        style={{
                                                            width: `${Number(review.percentage)}%`
                                                        }}
                                                    />
                                                </div>


                                                <div className="review-marks">

                                                    <span>Technical: {review.technical_skills}/10</span>
                                                    <span>Problem Solving: {review.problem_solving}/10</span>
                                                    <span>Communication: {review.communication}/10</span>
                                                    <span>Discipline: {review.discipline}/10</span>
                                                    <span>Participation: {review.participation}/10</span>
                                                    <span>Task Completion: {review.task_completion}/10</span>

                                                </div>


                                                {review.remarks && (
                                                    <p className="review-remarks">
                                                        {review.remarks}
                                                    </p>
                                                )}


                                                <div className="review-actions">

                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => openPerformanceModal(review)}
                                                    >
                                                        Edit Review
                                                    </button>

                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => deletePerformance(review)}
                                                    >
                                                        Delete Review
                                                    </button>

                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                ) : (

                                    <p className="empty-text">
                                        No performance reviews added yet.
                                    </p>

                                )}

                            </div>


                            <div className="details-footer">

                                <button
                                    className="modal-cancel-btn"
                                    onClick={() => {
                                        closeDetailsModal();
                                        openEditModal(detailStudent);
                                    }}
                                >
                                    Edit Student
                                </button>

                                <button
                                    className="modal-save-btn"
                                    onClick={() => deleteStudent(detailStudent)}
                                >
                                    Delete Student
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================
                ADD / EDIT PERFORMANCE MODAL
            ===================================== */}

            {performanceOpen && (

                <div
                    className="student-modal-overlay performance-overlay"
                    onClick={closePerformanceModal}
                >

                    <div
                        className="performance-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="student-modal-header">

                            <h2>
                                {editingReview ? "Edit Performance" : "Add Performance"}
                            </h2>

                            <button
                                className="modal-close-btn"
                                onClick={closePerformanceModal}
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={savePerformance}>

                            <div className="performance-form">

                                <p className="performance-help">
                                    Give marks between 0 and 10 for each category.
                                </p>

                                <div className="performance-grid">

                                    {[
                                        ["technical_skills", "Technical Skills"],
                                        ["problem_solving", "Problem Solving"],
                                        ["communication", "Communication"],
                                        ["discipline", "Discipline"],
                                        ["participation", "Participation"],
                                        ["task_completion", "Task Completion"]
                                    ].map(([field, label]) => (

                                        <div className="performance-field" key={field}>

                                            <label>{label} (0-10)</label>

                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="1"
                                                value={performance[field]}
                                                onChange={(e) => updatePerformance(field, e.target.value)}
                                            />

                                            {performanceErrors[field] && (
                                                <small>{performanceErrors[field]}</small>
                                            )}

                                        </div>

                                    ))}


                                    <div className="performance-field full-width">

                                        <label>Remarks</label>

                                        <textarea
                                            value={performance.remarks}
                                            onChange={(e) => updatePerformance("remarks", e.target.value)}
                                            placeholder="Write student feedback..."
                                        />

                                    </div>

                                </div>


                                {performanceErrors.server && (
                                    <div className="modal-server-error">
                                        {performanceErrors.server}
                                    </div>
                                )}

                            </div>


                            <div className="student-modal-footer">

                                <button
                                    type="button"
                                    className="modal-cancel-btn"
                                    onClick={closePerformanceModal}
                                    disabled={performanceLoading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="modal-save-btn"
                                    disabled={performanceLoading}
                                >
                                    {performanceLoading
                                        ? "Saving..."
                                        : editingReview
                                            ? "Update Review"
                                            : "Save Review"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

};
