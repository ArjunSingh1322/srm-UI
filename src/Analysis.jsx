
import React, { useEffect, useState } from "react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

import { Sidebar } from "./Sidebar";
import "./Analysis.css";

const API = "https://srm-server-cyan.vercel.app";

const COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];

export function Analysis() {

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isOpen, setIsOpen] = useState(false);

    // DATE FILTER STATES
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");

    // ANALYSIS STATES
    const [analysis, setAnalysis] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState("");

    const token = sessionStorage.getItem("SRM_Token");

    // FETCH ALL STUDENTS
    useEffect(() => {

        async function fetchStudents() {

            try {

                const res = await fetch(`${API}/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error("Unable to fetch students");
                }

                const data = await res.json();

                setStudents(
                    Array.isArray(data)
                        ? data
                        : data.users || data.students || []
                );

            } catch (err) {

                setError(err.message);

            } finally {

                setLoading(false);

            }
        }

        fetchStudents();

    }, []);

    // COURSE-WISE COUNT FOR ALL STUDENTS
    const courseData = Object.values(

        students.reduce((acc, student) => {

            if (!student.course) return acc;

            if (!acc[student.course]) {
                acc[student.course] = {
                    course: student.course,
                    count: 0
                };
            }

            acc[student.course].count++;

            return acc;

        }, {})

    );

    // SEARCH ANALYSIS API
    async function Searchanalysis() {

        if (!year && !month && !day) {
            setAnalysisError("Please enter at least one date filter.");
            return;
        }

        if (month && (+month < 1 || +month > 12)) {
            setAnalysisError("Month must be between 1 and 12.");
            return;
        }

        if (day && (+day < 1 || +day > 31)) {
            setAnalysisError("Day must be between 1 and 31.");
            return;
        }

        if (year && (+year < 1000 || +year > 9999)) {
            setAnalysisError("Please enter a valid year.");
            return;
        }

        try {

            setAnalysisLoading(true);
            setAnalysisError("");
            setAnalysis(null);

            const params = new URLSearchParams();

            if (year) params.append("year", year);
            if (month) params.append("month", month);
            if (day) params.append("day", day);

            const res = await fetch(
                `${API}/analytics?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) {
                throw new Error("Unable to fetch analysis data.");
            }

            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message || "Analysis failed.");
            }

            const records = Array.isArray(result.data)
                ? result.data
                : [];

            // COUNT STUDENTS COURSE-WISE
            const courseCounts = Object.values(

                records.reduce((acc, student) => {

                    if (!student.course) return acc;

                    if (!acc[student.course]) {
                        acc[student.course] = {
                            course: student.course,
                            count: 0
                        };
                    }

                    acc[student.course].count++;

                    return acc;

                }, {})

            );

            setAnalysis({
                total: records.length,
                courses: courseCounts,
                filters: { year, month, day }
            });

        } catch (err) {

            setAnalysisError(err.message);

        } finally {

            setAnalysisLoading(false);

        }
    }

    // RESET FILTERS
    function resetAnalysis() {

        setYear("");
        setMonth("");
        setDay("");

        setAnalysis(null);
        setAnalysisError("");

    }

    const dateLabel = analysis
        ? [
            analysis.filters.day,
            analysis.filters.month,
            analysis.filters.year
        ].filter(Boolean).join(" / ")
        : "";

    return (

        <div className="analysis-layout">

            <Sidebar
                className="analysis-sidebar"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />

            <main className="analysis-main">

                <button
                    className="hamburger"
                    onClick={() => setIsOpen(true)}
                >
                    ☰
                </button>

                <div className="analysis-page">

                    {/* HEADER */}

                    <header className="analysis-header">

                        <p className="analysis-breadcrumb">
                            Pages / Analysis
                        </p>

                        <h1>Student Analysis</h1>

                        <p className="analysis-subtitle">
                            Monitor student admissions and course performance.
                        </p>

                    </header>

                    {loading ? (

                        <div className="analysis-empty">
                            Loading dashboard...
                        </div>

                    ) : error ? (

                        <div className="analysis-error">
                            {error}
                        </div>

                    ) : (

                        <>

                            {/* STATISTICS */}

                            <section className="analysis-stats">

                                <div className="analysis-stat-card">

                                    <div className="analysis-stat-icon">
                                        ♙
                                    </div>

                                    <p>Total Students</p>

                                    <h2>{students.length}</h2>

                                    <small>All registered students</small>

                                </div>

                                <div className="analysis-stat-card">

                                    <div className="analysis-stat-icon analysis-blue">
                                        ▤
                                    </div>

                                    <p>Total Courses</p>

                                    <h2>{courseData.length}</h2>

                                    <small>Available courses</small>

                                </div>

                            </section>


                            {/* DATE FILTER */}

                            <section className="analysis-filter-card">

                                <div className="analysis-filter-heading">

                                    <div>
                                        <h3>Admission Date Filter</h3>

                                        <p>
                                            Select a year, month or specific date
                                            to analyse student admissions.
                                        </p>
                                    </div>

                                    <span className="filter-icon">
                                        ▦
                                    </span>

                                </div>

                                <div className="analysis-filter-inputs">

                                    <div className="filter-field">

                                        <label>Year</label>

                                        <input
                                            type="number"
                                            placeholder="e.g. 2022"
                                            value={year}
                                            min="1000"
                                            max="9999"
                                            onChange={(e) => setYear(e.target.value)}
                                        />

                                    </div>

                                    <div className="filter-field">

                                        <label>Month</label>

                                        <input
                                            type="number"
                                            placeholder="1 - 12"
                                            value={month}
                                            min="1"
                                            max="12"
                                            onChange={(e) => setMonth(e.target.value)}
                                        />

                                    </div>

                                    <div className="filter-field">

                                        <label>Day</label>

                                        <input
                                            type="number"
                                            placeholder="1 - 31"
                                            value={day}
                                            min="1"
                                            max="31"
                                            onChange={(e) => setDay(e.target.value)}
                                        />

                                    </div>

                                    <button
                                        className="analysis-search-btn"
                                        onClick={Searchanalysis}
                                        disabled={analysisLoading}
                                    >
                                        {analysisLoading
                                            ? "Searching..."
                                            : "⌕  Search"}
                                    </button>

                                    <button
                                        className="analysis-reset-btn"
                                        onClick={resetAnalysis}
                                    >
                                        Reset
                                    </button>

                                </div>

                                {analysisError && (

                                    <p className="analysis-error">
                                        {analysisError}
                                    </p>

                                )}

                            </section>


                            {/* CHARTS */}

                            <section className="analysis-charts">

                                {/* OVERALL COURSE CHART */}

                                <div className="analysis-chart-card">

                                    <div className="chart-heading">

                                        <div>
                                            <h3>Students by Course</h3>

                                            <p>
                                                Overall course-wise student distribution
                                            </p>
                                        </div>

                                        <span className="chart-tag">
                                            Overall
                                        </span>

                                    </div>

                                    {courseData.length === 0 ? (

                                        <div className="analysis-empty">
                                            No student data available.
                                        </div>

                                    ) : (

                                        <ResponsiveContainer width="100%" height={280}>

                                            <LineChart data={courseData}>

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    stroke="#e5e7eb"
                                                />

                                                <XAxis
                                                    dataKey="course"
                                                    tick={{ fontSize: 11 }}
                                                />

                                                <YAxis
                                                    allowDecimals={false}
                                                    tick={{ fontSize: 12 }}
                                                />

                                                <Tooltip />

                                                <Line
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke="#6366f1"
                                                    strokeWidth={3}
                                                    dot={{ r: 5 }}
                                                    activeDot={{ r: 7 }}
                                                />

                                            </LineChart>

                                        </ResponsiveContainer>

                                    )}

                                </div>


                                {/* SEARCHED COURSE RESULTS */}

                                <div className="analysis-chart-card">

                                    <div className="chart-heading">

                                        <div>
                                            <h3>Filtered Course Analysis</h3>

                                            <p>
                                                {analysis
                                                    ? `Admission results for ${dateLabel}`
                                                    : "Search a date to see course-wise counts"}
                                            </p>
                                        </div>

                                        <span className="chart-tag">
                                            Filtered
                                        </span>

                                    </div>

                                    {!analysis ? (

                                        <div className="analysis-search-placeholder">

                                            <div className="placeholder-icon">
                                                ▦
                                            </div>

                                            <h4>No Analysis Yet</h4>

                                            <p>
                                                Select a year, month or day above
                                                and click Search.
                                            </p>

                                        </div>

                                    ) : (

                                        <>

                                            <div className="analysis-result-total">

                                                <div>
                                                    <small>Matching Students</small>
                                                    <h2>{analysis.total}</h2>
                                                </div>

                                                <div>
                                                    <small>Total Courses</small>
                                                    <h2>{analysis.courses.length}</h2>
                                                </div>

                                            </div>

                                            {analysis.courses.length === 0 ? (

                                                <div className="analysis-empty">
                                                    No students found for this date.
                                                </div>

                                            ) : (

                                                <div className="analysis-course-list">

                                                    {analysis.courses.map((item, index) => (

                                                        <div
                                                            className="analysis-course-item"
                                                            key={item.course}
                                                        >

                                                            <div className="course-item-info">

                                                                <span
                                                                    className="course-dot"
                                                                    style={{
                                                                        backgroundColor:
                                                                            COLORS[index % COLORS.length]
                                                                    }}
                                                                />

                                                                <span>{item.course}</span>

                                                            </div>

                                                            <strong>{item.count}</strong>

                                                        </div>

                                                    ))}

                                                </div>

                                            )}

                                        </>

                                    )}

                                </div>

                            </section>

                        </>

                    )}

                    {/* FOOTER */}

                    <footer className="analysis-footer">
                        © 2026 SRM Student Management System
                    </footer>

                </div>

            </main>

        </div>

    );

}
