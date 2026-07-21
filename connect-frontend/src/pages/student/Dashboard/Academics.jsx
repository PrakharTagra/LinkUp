import React, { useState, useEffect } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { CourseCard } from "../../../components/academics/CourseCard";
import { SessionCard } from "../../../components/academics/CourseCard";
import Loader from "../../../components/common/Loader";
import { getCourses, getSessions } from "../../../services/courseService";

const TABS = ["All", "Courses", "Live Sessions", "Workshops"];

export default function Academics() {
  const [activeTab, setActiveTab] = useState("All");
  const [COURSES, setCourses] = useState([]);
  const [SESSIONS, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const [coursesData, sessionsData] = await Promise.all([
          getCourses(),
          getSessions()
        ]);
        
        const mappedCourses = (coursesData.courses || []).map(c => ({
          id: c._id,
          type: "course",
          title: c.title,
          thumbnail: c.thumbnail,
          instructor: { name: c.instructor?.name || "Instructor", company: c.instructor?.company || "Connect Alumni" },
          rating: c.rating?.average || 4.5,
          reviews: c.rating?.count || 12,
          modules: 10,
          enrolled: c.enrolledStudents?.length || 0,
          price: c.discountedPrice ?? c.price,
          basePrice: c.price,
          originalPrice: (c.discountedPrice && c.discountedPrice < c.price) ? c.price : (c.originalPrice || undefined),
          discountedPrice: c.discountedPrice,
          membershipDiscountPercent: c.membershipDiscountPercent || 0,
          hasMembershipDiscount: Boolean(c.hasMembershipDiscount),
        }));

        const mappedSessions = (sessionsData.sessions || []).map(s => ({
          id: s._id,
          title: s.title,
          type: s.type || "Live Session",
          thumbnail: s.thumbnail,
          instructor: { name: s.instructor?.name || "Instructor", company: s.instructor?.company || "Connect Alumni" },
          date: new Date(s.date || Date.now()).toLocaleDateString(),
          time: s.time || "6:00 PM IST",
          duration: s.duration || "1 hour",
          enrolled: s.enrolledStudents?.length || 0,
          price: s.discountedPrice ?? s.price,
          basePrice: s.price,
          originalPrice: (s.discountedPrice && s.discountedPrice < s.price) ? s.price : undefined,
          discountedPrice: s.discountedPrice,
          membershipDiscountPercent: s.membershipDiscountPercent || 0,
          hasMembershipDiscount: Boolean(s.hasMembershipDiscount),
          status: s.status || "upcoming"
        }));

        setCourses(mappedCourses);
        setSessions(mappedSessions);
      } catch (err) {
        console.error("Academics fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const showCourses   = activeTab === "All" || activeTab === "Courses";
  const showSessions  = activeTab === "All" || activeTab === "Live Sessions" || activeTab === "Workshops";

  return (
    <MainLayout>
      <div style={{ padding: "24px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 4 }}>
            Academics
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>
            Courses, live sessions & workshops by verified alumni
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "7px 18px", borderRadius: 99, flexShrink: 0,
              background: activeTab === tab ? "linear-gradient(135deg, #7C5CFC, #9B7EFF)" : "var(--bg-3)",
              border: `1px solid ${activeTab === tab ? "transparent" : "var(--border)"}`,
              color: activeTab === tab ? "white" : "var(--text-2)",
              fontSize: 13, fontWeight: activeTab === tab ? 700 : 400,
              fontFamily: activeTab === tab ? "Plus Jakarta Sans" : "DM Sans",
              cursor: "pointer", transition: "all 0.2s",
              boxShadow: activeTab === tab ? "0 4px 14px rgba(124,92,252,0.3)" : "none",
            }}>{tab}</button>
          ))}
        </div>

        {loading && <Loader text="Loading courses and sessions..." />}

        {/* Courses */}
        {!loading && showCourses && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
                Courses
              </h2>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>{COURSES.length} available</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
              {COURSES.map((course, i) => (
                <div key={course.id} style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${i * 80}ms` }}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sessions */}
        {!loading && showSessions && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
                Live Sessions & Workshops
              </h2>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>{SESSIONS.length} upcoming</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
              {SESSIONS.map((session, i) => (
                <div key={session.id} style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${i * 80}ms` }}>
                  <SessionCard session={session} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}