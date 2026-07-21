import Earning from "../models/Earning.js";

// ─────────────────────────────
// GET MY EARNINGS
// ─────────────────────────────
export const getMyEarnings = async (req, res) => {
  try {
    const earnings = await Earning.find({ alumni: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ earnings });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────
// GET EARNING STATS
// ─────────────────────────────
export const getEarningStats = async (req, res) => {
  try {
    const earnings = await Earning.find({ alumni: req.user._id });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEarnings = earnings.filter(e => new Date(e.createdAt) >= startOfMonth);
    const total = earnings.reduce((sum, e) => sum + (e.grossAmount || 0), 0);
    const platformFee = earnings.reduce((sum, e) => sum + (e.platformFee || 0), 0);
    const net = total - platformFee;
    const thisMonth = thisMonthEarnings.reduce((sum, e) => sum + (e.alumniShare || 0), 0);

    res.json({
      totalGross: total,
      netEarnings: net,
      platformFee,
      thisMonth,
      sessionCount: earnings.length,
      totalTransactions: earnings.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────
// REQUEST WITHDRAWAL
// ─────────────────────────────
export const requestWithdrawal = async (req, res) => {
  try {
    // ⚠️ Dummy logic (you can integrate Razorpay later)
    res.json({ message: "Withdrawal request submitted (manual process)" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};