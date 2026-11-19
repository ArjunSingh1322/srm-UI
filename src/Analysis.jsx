
import React, { useEffect, useState } from "react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import {
    AreaChart,
    Area,
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

    // AGE-WISE STUDENT DISTRIBUTION
    const ageData = [
        { name: "20–25 Years", count: 0, color: "#6366f1" },
        { name: "26–30 Years", count: 0, color: "#8b5cf6" },
        { name: "31–40 Years", count: 0, color: "#c4b5fd" }
    ];

    students.forEach((student) => {
        const age = Number(student.age);
        if (!Number.isFinite(age)) return;

        if (age >= 20 && age <= 25) ageData[0].count++;
        else if (age >= 26 && age <= 30) ageData[1].count++;
        else if (age >= 31 && age <= 40) ageData[2].count++;
    });

    const ageChartData = ageData.filter((item) => item.count > 0);
    const ageChartTotal = ageChartData.reduce((sum, item) => sum + item.count, 0);

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

                                <div className="analysis-stat-card analysis-age-card">

                                    <div className="age-card-heading">
                                        <div>
                                            <p>Age Distribution</p>
                                            <small>Students aged 20–40</small>
                                        </div>
                                        <span className="age-chart-icon">◉</span>
                                    </div>

                                    {ageChartTotal === 0 ? (
                                        <div className="age-chart-empty">
                                            <p>No students in these age groups</p>
                                        </div>
                                    ) : (
                                        <div className="age-chart-content">
                                            <div className="age-pie-wrap">
                                                <ResponsiveContainer width="100%" height={170}>
                                                    <PieChart>
                                                        <Pie
                                                            data={ageChartData}
                                                            dataKey="count"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={48}
                                                            outerRadius={70}
                                                            paddingAngle={4}
                                                            stroke="none"
                                                        >
                                                            {ageChartData.map((entry) => (
                                                                <Cell
                                                                    key={entry.name}
                                                                    fill={entry.color}
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            formatter={(value, name) => [value, name]}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="age-pie-center">
                                                    <strong>{ageChartTotal}</strong>
                                                    <span>Students</span>
                                                </div>
                                            </div>

                                            <div className="age-chart-legend">
                                                {ageData.map((item) => (
                                                    <div className="age-legend-item" key={item.name}>
                                                        <span
                                                            className="age-legend-dot"
                                                            style={{ background: item.color }}
                                                        />
                                                        <span className="age-legend-label">{item.name}</span>
                                                        <strong>{item.count}</strong>
                                                        <small>
                                                            {ageChartTotal
                                                                ? `${Math.round((item.count / ageChartTotal) * 100)}%`
                                                                : "0%"}
                                                        </small>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

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
    <AreaChart
        data={courseData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
    >
        <defs>
            <linearGradient
                id="purpleGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
            >
                <stop
                    offset="0%"
                    stopColor="#6366f1"
                    stopOpacity={0.35}
                />

                <stop
                    offset="100%"
                    stopColor="#6366f1"
                    stopOpacity={0.02}
                />
            </linearGradient>
        </defs>

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

        <Area
            type="monotone"
            dataKey="count"
            stroke="#6366f1"
            strokeWidth={3}
            fill="url(#purpleGradient)"
            fillOpacity={1}
            dot={{
                r: 4,
                fill: "#ffffff",
                stroke: "#6366f1",
                strokeWidth: 2
            }}
            activeDot={{
                r: 7,
                fill: "#6366f1",
                stroke: "#ffffff",
                strokeWidth: 2
            }}
        />
    </AreaChart>
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
