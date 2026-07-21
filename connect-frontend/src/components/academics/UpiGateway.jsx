import React, { useState, useEffect } from "react";

const SUCCESS_ICON = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#00E5C3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const CLOCK_ICON = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
);

export default function UpiGateway({ amount, onPaymentComplete, courseTitle }) {
    const [step, setStep] = useState(1); // 1: QR/Select, 2: Processing, 3: Success
    const [timeLeft, setTimeLeft] = useState(300); // 5 mins

    useEffect(() => {
        if (step === 1 && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [step, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const handleSimulatorPayment = () => {
        setStep(2);
        setTimeout(() => {
            setStep(3);
            setTimeout(() => {
                onPaymentComplete({
                    id: `pay_${Math.random().toString(36).slice(2, 11)}`,
                    method: "upi"
                });
            }, 2000);
        }, 2500);
    };

    return (
        <div style={{
            background: "#0F1018", padding: "32px 24px", borderRadius: 24,
            width: "100%", maxWidth: 400, margin: "0 auto",
            border: "1px solid rgba(124, 92, 252, 0.2)",
            color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif",
            textAlign: "center"
        }}>
            {step === 1 && (
                <>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Pay with UPI</h3>
                    <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>Scan the QR code or use your UPI app</p>

                    <div style={{
                        background: "#fff", padding: 20, borderRadius: 18, width: 220, height: 220,
                        margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.5)", position: "relative"
                    }}>
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=connect@upi&pn=Connect&am=${amount}&cu=INR&tn=CourseEnrollment`} 
                            alt="Payment QR" 
                            style={{ width: "100%", borderRadius: 8 }}
                        />
                        <div style={{ position: "absolute", inset: 0, border: "2px solid var(--purple)", borderRadius: 18, opacity: 0.1 }} />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32, padding: "8px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, width: "fit-content", margin: "0 auto 32px" }}>
                        <span style={{ color: "var(--text-3)" }}><CLOCK_ICON /></span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>Expires in {formatTime(timeLeft)}</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                        {["PhonePe", "Google Pay"].map(app => (
                            <button key={app} onClick={handleSimulatorPayment} style={{
                                padding: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                                borderRadius: 14, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                                transition: "all 0.2s"
                            }}>Pay via {app}</button>
                        ))}
                    </div>

                    <div style={{ padding: "16px", background: "rgba(124, 92, 252, 0.05)", borderRadius: 14, border: "1px solid rgba(124, 92, 252, 0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, color: "var(--text-3)" }}>Order Amount</span>
                            <span style={{ fontSize: 13, color: "var(--text-2)" }}>₹{amount.toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 13, color: "var(--text-3)" }}>Course</span>
                            <span style={{ fontSize: 13, color: "var(--text-2)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{courseTitle}</span>
                        </div>
                    </div>
                </>
            )}

            {step === 2 && (
                <div style={{ padding: "48px 24px" }}>
                    <div style={{ 
                        width: 64, height: 64, border: "3px solid rgba(124, 92, 252, 0.1)", 
                        borderTopColor: "var(--purple)", borderRadius: "50%", 
                        margin: "0 auto 24px", animation: "spin 1s linear infinite" 
                    }} />
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Processing Payment</h3>
                    <p style={{ fontSize: 14, color: "var(--text-3)" }}>Please do not close this window or press back button. Communicating with your bank...</p>
                </div>
            )}

            {step === 3 && (
                <div style={{ padding: "48px 24px" }}>
                    <div style={{ marginBottom: 24, animation: "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                        <SUCCESS_ICON />
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: "#00E5C3" }}>Payment Success!</h3>
                    <p style={{ fontSize: 14, color: "var(--text-3)" }}>Your payment of <strong>₹{amount.toLocaleString()}</strong> was successful. Enrollment is active.</p>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}
