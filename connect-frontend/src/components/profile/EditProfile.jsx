import React, { useState } from "react";

const inputStyle = {
  width: "100%", padding: "11px 14px",
  background: "var(--bg-3)", border: "1px solid var(--border)",
  borderRadius: 11, color: "var(--text)", fontSize: 14,
  outline: "none", fontFamily: "DM Sans", transition: "border-color 0.2s, box-shadow 0.2s",
};

const labelStyle = {
  display: "block", fontSize: 12, color: "var(--text-3)",
  fontWeight: 600, marginBottom: 7, letterSpacing: "0.02em",
};

export default function EditProfile({ user = {}, onSave }) {
  const isStudent = user?.role === "student";
  const isAlumni = user?.role === "alumni";

  const initialEducation = Array.isArray(user.education) && user.education.length > 0
    ? user.education
    : (user.college || user.degree || user.joiningYear || user.passingYear)
      ? [{
          institution: user.college || "",
          degree: user.degree || "",
          fieldOfStudy: user.branch || "",
          startYear: user.joiningYear || "",
          endYear: user.passingYear || "",
          grade: "",
          description: "",
        }]
      : [{ institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "", grade: "", description: "" }];

  const initialProjects = Array.isArray(user.projects) && user.projects.length > 0
    ? user.projects.map((project) => ({
        title: project.title || "",
        link: project.link || "",
        description: project.description || "",
        fileUrl: project.fileUrl || "",
        fileName: project.fileName || "",
        fileType: project.fileType || "",
        fileData: "",
      }))
    : [{ title: "", link: "", description: "", fileUrl: "", fileName: "", fileType: "", fileData: "" }];

  const [form, setForm] = useState({
    name:    user.name    || "",
    email:   user.email   || "",
    title:   user.title   || "",
    company: user.company || "",
    college: user.college || "",
    domain: user.domain || "",
    about:   user.about   || "",
    degree:  user.degree  || "",
    joiningYear: user.joiningYear || "",
    passingYear: user.passingYear || "",
    skills:  user.skills?.join(", ") || "",
    certifications: user.certifications?.join(", ") || "",
    education: initialEducation,
    projects: initialProjects,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const setEducationField = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.map((item, i) => (
        i === index ? { ...item, [key]: value } : item
      )),
    }));
  };

  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "", grade: "", description: "" },
      ],
    }));
  };

  const removeEducation = (index) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const setProjectField = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));
  };

  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: "", link: "", description: "", fileUrl: "", fileName: "", fileType: "", fileData: "" },
      ],
    }));
  };

  const removeProject = (index) => {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handleProjectFileChange = async (index, file) => {
    if (!file) return;

    try {
      const fileData = await toBase64(file);
      setForm((prev) => ({
        ...prev,
        projects: prev.projects.map((project, i) => (
          i === index
            ? {
                ...project,
                fileData,
                fileName: file.name,
                fileType: file.type || "",
              }
            : project
        )),
      }));
    } catch (err) {
      console.error("Project file read failed:", err);
      alert("Failed to read project file. Please try again.");
    }
  };

  const handleSubmit = () => {
    const education = form.education
      .map((entry) => ({
        institution: (entry.institution || "").trim(),
        degree: (entry.degree || "").trim(),
        fieldOfStudy: (entry.fieldOfStudy || "").trim(),
        startYear: entry.startYear ? Number(entry.startYear) : undefined,
        endYear: entry.endYear ? Number(entry.endYear) : undefined,
        grade: (entry.grade || "").trim(),
        description: (entry.description || "").trim(),
      }))
      .filter((entry) => entry.institution || entry.degree || entry.fieldOfStudy);

    const primaryEducation = education[0] || {};

    const payload = {
      name: form.name,
      email: form.email,
      about: form.about,
      skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      certifications: form.certifications.split(",").map(c => c.trim()).filter(Boolean),
      education,
      college: primaryEducation.institution || form.college,
      degree: primaryEducation.degree || form.degree,
      joiningYear: primaryEducation.startYear || form.joiningYear,
      passingYear: primaryEducation.endYear || form.passingYear,
      branch: primaryEducation.fieldOfStudy || "",
    };

    if (isAlumni) {
      payload.title = form.title;
      payload.company = form.company;
      payload.domain = form.domain;
      payload.projects = form.projects
        .map((project) => ({
          title: (project.title || "").trim(),
          link: (project.link || "").trim(),
          description: (project.description || "").trim(),
          fileUrl: project.fileUrl || "",
          fileName: project.fileName || "",
          fileType: project.fileType || "",
          fileData: project.fileData || "",
        }))
        .filter((project) => project.title || project.link || project.description || project.fileUrl || project.fileData);
    }

    onSave?.(payload);
  };

  const commonFields = [
    { key: "name",    label: "Full Name",       placeholder: "e.g. Rahul Sharma"             },
    { key: "email",   label: "Email Address",   placeholder: "e.g. rahul@example.com"        },
    { key: "college", label: "College",          placeholder: "e.g. Ajay Kumar Garg Engineering College" },
  ];

  const alumniOnlyFields = [
    { key: "title", label: "Title / Position", placeholder: "e.g. Software Engineer" },
    { key: "company", label: "Company", placeholder: "e.g. Google" },
    { key: "domain", label: "Domain", placeholder: "e.g. AI/ML, Backend, Product" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {commonFields.map(f => (
        <div key={f.key}>
          <label style={labelStyle}>{f.label}</label>
          <input
            type="text"
            value={form[f.key]}
            onChange={e => set(f.key, e.target.value)}
            placeholder={f.placeholder}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = "var(--purple)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      ))}

      {isAlumni && alumniOnlyFields.map((f) => (
        <div key={f.key}>
          <label style={labelStyle}>{f.label}</label>
          <input
            type="text"
            value={form[f.key]}
            onChange={e => set(f.key, e.target.value)}
            placeholder={f.placeholder}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = "var(--purple)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      ))}

      {/* About */}
      <div>
        <label style={labelStyle}>About</label>
        <textarea
          rows={4}
          value={form.about}
          onChange={e => set("about", e.target.value)}
          placeholder={isStudent ? "Write a short student bio and learning goals..." : "Tell students about your experience and what you can help with..."}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          onFocus={e => { e.target.style.borderColor = "var(--purple)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      {/* Certifications */}
      <div>
        <label style={labelStyle}>Certifications (comma separated)</label>
        <input
          type="text"
          value={form.certifications}
          onChange={e => set("certifications", e.target.value)}
          placeholder="AWS SAA, Google Cloud ACE, Meta React..."
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor = "var(--purple)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      {/* Education */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Education Details</label>
          <button
            type="button"
            onClick={addEducation}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 9,
              background: "var(--bg-3)",
              color: "var(--text-2)",
              fontSize: 12,
              fontWeight: 700,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            + Add Education
          </button>
        </div>

        {form.education.map((edu, index) => (
          <div
            key={`${index}-${edu.institution || "edu"}`}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 12,
              background: "var(--bg-3)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input
                type="text"
                value={edu.institution || ""}
                onChange={(e) => setEducationField(index, "institution", e.target.value)}
                placeholder="Institution"
                style={inputStyle}
              />
              <input
                type="text"
                value={edu.degree || ""}
                onChange={(e) => setEducationField(index, "degree", e.target.value)}
                placeholder="Degree"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <input
                type="text"
                value={edu.fieldOfStudy || ""}
                onChange={(e) => setEducationField(index, "fieldOfStudy", e.target.value)}
                placeholder="Field of Study"
                style={inputStyle}
              />
              <input
                type="number"
                value={edu.startYear || ""}
                onChange={(e) => setEducationField(index, "startYear", e.target.value)}
                placeholder="Start Year"
                style={inputStyle}
              />
              <input
                type="number"
                value={edu.endYear || ""}
                onChange={(e) => setEducationField(index, "endYear", e.target.value)}
                placeholder="End Year"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
              <input
                type="text"
                value={edu.grade || ""}
                onChange={(e) => setEducationField(index, "grade", e.target.value)}
                placeholder="Grade / CGPA (optional)"
                style={inputStyle}
              />
              {form.education.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  style={{
                    border: "1px solid rgba(239,68,68,0.35)",
                    borderRadius: 9,
                    background: "rgba(239,68,68,0.08)",
                    color: "#EF4444",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "0 10px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            <textarea
              rows={2}
              value={edu.description || ""}
              onChange={(e) => setEducationField(index, "description", e.target.value)}
              placeholder="Highlights, projects, societies (optional)"
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </div>
        ))}
      </div>

      {/* Skills */}
      <div>
        <label style={labelStyle}>Skills (comma separated)</label>
        <input
          type="text"
          value={form.skills}
          onChange={e => set("skills", e.target.value)}
          placeholder="DSA, React, System Design, Python…"
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor = "var(--purple)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,92,252,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
        />
        {/* Skill chips preview */}
        {form.skills && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {form.skills.split(",").map(s => s.trim()).filter(Boolean).map((s, i) => (
              <span key={i} style={{
                padding: "3px 12px", borderRadius: 99, fontSize: 12,
                background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.22)",
                color: "var(--purple-light)",
              }}>{s}</span>
            ))}
          </div>
        )}
      </div>

      {isAlumni && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Projects</label>
            <button
              type="button"
              onClick={addProject}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 9,
                background: "var(--bg-3)",
                color: "var(--text-2)",
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              + Add Project
            </button>
          </div>

          {form.projects.map((project, index) => (
            <div
              key={`${index}-${project.title || "project"}`}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 12,
                background: "var(--bg-3)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <input
                type="text"
                value={project.title || ""}
                onChange={(e) => setProjectField(index, "title", e.target.value)}
                placeholder="Project title"
                style={inputStyle}
              />

              <input
                type="url"
                value={project.link || ""}
                onChange={(e) => setProjectField(index, "link", e.target.value)}
                placeholder="Project link (GitHub, live demo, case study)"
                style={inputStyle}
              />

              <textarea
                rows={3}
                value={project.description || ""}
                onChange={(e) => setProjectField(index, "description", e.target.value)}
                placeholder="What this project does and your contribution"
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
                <input
                  type="file"
                  onChange={(e) => handleProjectFileChange(index, e.target.files?.[0])}
                  style={{ ...inputStyle, padding: "10px" }}
                />

                {form.projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    style={{
                      border: "1px solid rgba(239,68,68,0.35)",
                      borderRadius: 9,
                      background: "rgba(239,68,68,0.08)",
                      color: "#EF4444",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "9px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {(project.fileName || project.fileUrl) && (
                <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
                  Attached: {project.fileName || "Existing file"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Save */}
      <button onClick={handleSubmit} style={{
        width: "100%", padding: "13px",
        background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
        border: "none", borderRadius: 12,
        color: "white", fontSize: 15, fontWeight: 700, fontFamily: "Plus Jakarta Sans",
        cursor: "pointer", transition: "opacity 0.2s",
        boxShadow: "0 6px 20px rgba(124,92,252,0.35)",
        marginTop: 4,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        Save Changes →
      </button>
    </div>
  );
}