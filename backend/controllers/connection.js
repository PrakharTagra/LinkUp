import Connection from "../models/Connection.js";
import Alumni from '../models/Alumni.js';
import { findUserById } from "../utils/userModels.js";

const roleToModel = {
  student: "Student",
  alumni: "Alumni",
  admin: "Admin",
};

// ─────────────────────────────────────────────
// SEND REQUEST
// ─────────────────────────────────────────────
export const sendRequest = async (req, res) => {
  try {
    const alumniId = req.params.id; // ✅ FIX
    const studentId = req.user._id;
    const fromModel = roleToModel[req.user.role];

    if (studentId.toString() === alumniId) {
      return res.status(400).json({ message: "Cannot connect with yourself" });
    }

    if (!fromModel) {
      return res.status(400).json({ message: "Invalid user role" });
    }

    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }

    const [existingDirect, existingReverse] = await Promise.all([
      Connection.findOne({ from: studentId, to: alumniId }),
      Connection.findOne({ from: alumniId, to: studentId }),
    ]);

    if (existingDirect) {
      if (existingDirect.status === "rejected") {
        existingDirect.fromModel = fromModel;
        existingDirect.toModel = "Alumni";
        existingDirect.status = "pending";
        await existingDirect.save();

        return res.status(200).json({
          message: "Connection request sent",
          connection: {
            _id: existingDirect._id,
            from: existingDirect.from,
            to: existingDirect.to,
            status: existingDirect.status,
          },
        });
      }

      return res.status(409).json({
        message:
          existingDirect.status === "accepted"
            ? "Already connected"
            : "Request already exists",
      });
    }

    if (existingReverse) {
      if (existingReverse.status === "pending") {
        existingReverse.status = "accepted";
        await existingReverse.save();
        return res.status(200).json({
          message: "Connected successfully",
          connection: {
            _id: existingReverse._id,
            from: existingReverse.from,
            to: existingReverse.to,
            status: existingReverse.status,
          },
        });
      }

      if (existingReverse.status === "accepted") {
        return res.status(409).json({ message: "Already connected" });
      }

      existingReverse.from = studentId;
      existingReverse.fromModel = fromModel;
      existingReverse.to = alumniId;
      existingReverse.toModel = "Alumni";
      existingReverse.status = "pending";
      await existingReverse.save();

      return res.status(200).json({
        message: "Connection request sent",
        connection: {
          _id: existingReverse._id,
          from: existingReverse.from,
          to: existingReverse.to,
          status: existingReverse.status,
        },
      });
    }

    const connection = await Connection.create({
      from: studentId,
      fromModel,
      to: alumniId,
      toModel: "Alumni",
      status: "pending",
    });

    res.status(201).json({
      message: "Connection request sent",
      connection: {
        _id: connection._id,
        from: connection.from,
        to: connection.to,
        status: connection.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// ACCEPT REQUEST
// ─────────────────────────────────────────────
export const acceptRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id); // ✅ FIX

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (connection.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    connection.status = "accepted";
    await connection.save();

    res.json({ message: "Connection accepted", connection });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// REJECT REQUEST
// ─────────────────────────────────────────────
export const rejectRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id); // ✅ FIX

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (connection.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    connection.status = "rejected";
    await connection.save();

    res.json({ message: "Connection rejected", connection });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET MY CONNECTIONS
// ─────────────────────────────────────────────
export const getMyConnections = async (req, res) => {
  try {
    const safeFindUserById = async (id) => {
      try {
        if (!id) return null;
        return await findUserById(id);
      } catch {
        return null;
      }
    };

    const currentUserId = String(req.user._id);

    const acceptedRows = await Connection.find({ status: "accepted" })
      .sort({ updatedAt: -1 })
      .lean();

    const myAcceptedRows = acceptedRows.filter(
      (row) => String(row.from) === currentUserId || String(row.to) === currentUserId
    );

    const connectionsRaw = await Promise.all(
      myAcceptedRows.map(async (row) => {
        const [fromUser, toUser] = await Promise.all([
          safeFindUserById(row.from),
          safeFindUserById(row.to),
        ]);

        if (!fromUser?._id || !toUser?._id) return null;

        return {
          ...row,
          from: {
            _id: fromUser._id,
            name: fromUser.name,
            avatar: fromUser.avatar,
            role: fromUser.role,
            college: fromUser.college,
            company: fromUser.company,
          },
          to: {
            _id: toUser._id,
            name: toUser.name,
            avatar: toUser.avatar,
            role: toUser.role,
            college: toUser.college,
            company: toUser.company,
          },
        };
      })
    );

    const connections = connectionsRaw.filter(Boolean);

    res.json({ connections });
  } catch (err) {
    console.error("getMyConnections error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET PENDING REQUESTS
// ─────────────────────────────────────────────
export const getPendingRequests = async (req, res) => {
  try {
    const safeFindUserById = async (id) => {
      try {
        if (!id) return null;
        return await findUserById(id);
      } catch {
        return null;
      }
    };

    const currentUserId = String(req.user._id);

    // Use lean data and manual matching to avoid refPath/populate model mismatch crashes.
    const allPending = await Connection.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();

    const myPendingRows = allPending.filter((row) => String(row.to) === currentUserId);

    const pendingRaw = await Promise.all(
      myPendingRows.map(async (row) => {
        const fromUser = await safeFindUserById(row.from);
        if (!fromUser?._id) return null;

        return {
          ...row,
          from: {
            _id: fromUser._id,
            name: fromUser.name,
            avatar: fromUser.avatar,
            role: fromUser.role,
            college: fromUser.college,
          },
        };
      })
    );

    const pending = pendingRaw.filter(Boolean);

    res.json({ pending });
  } catch (err) {
    console.error("getPendingRequests error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET CONNECTION STATUS
// ─────────────────────────────────────────────
export const getConnectionStatus = async (req, res) => {
  try {
    const userId = req.params.id; // ✅ FIX
    const currentUserId = req.user._id;

    const connection = await Connection.findOne({
      $or: [
        { from: currentUserId, to: userId },
        { from: userId, to: currentUserId },
      ],
    });

    if (!connection) {
      return res.json({ status: "connect" }); // ✅ FIX
    }

    res.json({ status: connection.status });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET MY PENDING (INCOMING + OUTGOING)
// ─────────────────────────────────────────────
export const getMyPendingConnections = async (req, res) => {
  try {
    const safeFindUserById = async (id) => {
      try {
        if (!id) return null;
        return await findUserById(id);
      } catch {
        return null;
      }
    };

    const currentUserId = String(req.user._id);

    const pendingRows = await Connection.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();

    const myRows = pendingRows.filter(
      (row) => String(row.from) === currentUserId || String(row.to) === currentUserId
    );

    const pendingRaw = await Promise.all(
      myRows.map(async (row) => {
        const isOutgoing = String(row.from) === currentUserId;
        const partnerId = isOutgoing ? row.to : row.from;
        const partner = await safeFindUserById(partnerId);

        if (!partner?._id) return null;

        return {
          _id: row._id,
          direction: isOutgoing ? "outgoing" : "incoming",
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          partner: {
            _id: partner._id,
            name: partner.name,
            avatar: partner.avatar,
            role: partner.role,
            college: partner.college,
            company: partner.company,
          },
        };
      })
    );

    const pending = pendingRaw.filter(Boolean);
    res.json({ pending });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};