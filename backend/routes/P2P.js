/**
 * ═══════════════════════════════════════════════════════════════
 *  P2P API ROUTES — Shivalik Connect
 *  Exposes Gossip, DHT, and PeerNetwork to the frontend
 * ═══════════════════════════════════════════════════════════════
 */

import { Router } from "express";
import gossipEngine from "../p2p/GossipProtocol.js";
import dht from "../p2p/DHT.js";
import peerNetwork from "../p2p/PeerNetwork.js";
import Student from "../models/Student.js";
import Alumni from "../models/Alumni.js";

const router = Router();

// ─────────────────────────────────────────────
// INITIALIZE — Seed the P2P network with DB users
// ─────────────────────────────────────────────
export const initP2PNetwork = async () => {
  try {
    const students = await Student.find({}).select("name email skills branch").limit(50);
    const alumni = await Alumni.find({}).select("name email skills company domain").limit(50);

    let peersAdded = 0;

    // Add students as peers
    for (const s of students) {
      const id = s._id.toString();
      gossipEngine.addPeer(id, { name: s.name, role: "student", skills: s.skills || [] });
      dht.addNode(id, { name: s.name, role: "student", skills: s.skills || [] });
      peerNetwork.registerPeer(id, { name: s.name, role: "student" });
      peersAdded++;
    }

    // Add alumni as peers
    for (const a of alumni) {
      const id = a._id.toString();
      gossipEngine.addPeer(id, { name: a.name, role: "alumni", skills: a.skills || [], company: a.company });
      dht.addNode(id, { name: a.name, role: "alumni", skills: a.skills || [], company: a.company });
      peerNetwork.registerPeer(id, { name: a.name, role: "alumni" });

      // Store alumni skills in DHT for searchability
      for (const skill of (a.skills || [])) {
        const key = `skill:${skill.toLowerCase().trim()}`;
        const existing = dht.lookup(key);
        const list = existing.found ? existing.value : [];
        list.push({ id, name: a.name, company: a.company, skill });
        dht.store(key, list);
      }

      peersAdded++;
    }

    // Create random connections between peers for demo
    const allIds = [...gossipEngine.peers.keys()];
    for (let i = 0; i < allIds.length; i++) {
      // Connect each peer to 2-4 random others
      const numConnections = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < numConnections; j++) {
        const targetIdx = Math.floor(Math.random() * allIds.length);
        if (targetIdx !== i) {
          gossipEngine.connectPeers(allIds[i], allIds[targetIdx]);
          peerNetwork.link(allIds[i], allIds[targetIdx]);
        }
      }
    }

    console.log(`[P2P] Network Initialized Automatically: ${peersAdded} peers added.`);
    return {
      message: "P2P network initialized",
      peersAdded,
    };
  } catch (err) {
    console.error("[P2P] Init failed:", err.message);
    throw err;
  }
};
router.post("/initialize", async (req, res) => {
  try {
    const result = await initP2PNetwork();
    res.json({
      ...result,
      gossipStats: gossipEngine.getNetworkStats(),
      dhtStats: dht.getStats(),
      networkStats: peerNetwork.getNetworkStats(),
    });
  } catch (err) {
    res.status(500).json({ message: "Init failed", error: err.message });
  }
});

// ─────────────────────────────────────────────
// GOSSIP — Simulate gossip propagation
// ─────────────────────────────────────────────
router.post("/gossip", (req, res) => {
  try {
    const { originPeerId, message } = req.body;

    // Pick origin: provided OR first peer
    const origin = originPeerId || [...gossipEngine.peers.keys()][0];
    if (!origin) {
      return res.status(400).json({ message: "No peers in network. Call /initialize first." });
    }

    const result = gossipEngine.gossip(origin, message || "Hello from P2P!");

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(500).json({ message: "Gossip failed", error: err.message });
  }
});

router.get("/gossip/stats", (req, res) => {
  res.json(gossipEngine.getNetworkStats());
});

router.get("/gossip/recent", (req, res) => {
  res.json(gossipEngine.getRecentPropagations(5));
});

// ─────────────────────────────────────────────
// DHT — Lookup and search
// ─────────────────────────────────────────────
router.get("/dht/lookup/:key", (req, res) => {
  try {
    const result = dht.lookup(req.params.key);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "DHT lookup failed", error: err.message });
  }
});

router.get("/dht/search/:skill", (req, res) => {
  try {
    const result = dht.searchBySkill(req.params.skill);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "DHT search failed", error: err.message });
  }
});

router.get("/dht/ring", (req, res) => {
  res.json(dht.getRingVisualization());
});

router.get("/dht/stats", (req, res) => {
  res.json(dht.getStats());
});

// ─────────────────────────────────────────────
// PEER NETWORK — Stats, paths, bridges
// ─────────────────────────────────────────────
router.get("/network/stats", (req, res) => {
  res.json(peerNetwork.getNetworkStats());
});

router.get("/network/path/:from/:to", (req, res) => {
  try {
    const result = peerNetwork.findShortestPath(req.params.from, req.params.to);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Path lookup failed", error: err.message });
  }
});

router.get("/network/bridges", (req, res) => {
  try {
    const bridges = peerNetwork.findBridgeNodes();
    res.json({
      bridgeNodes: bridges,
      count: bridges.length,
      explanation: "Bridge nodes are peers whose removal disconnects parts of the network",
    });
  } catch (err) {
    res.status(500).json({ message: "Bridge detection failed", error: err.message });
  }
});

// ─────────────────────────────────────────────
// COMBINED DASHBOARD
// ─────────────────────────────────────────────
router.get("/dashboard", (req, res) => {
  res.json({
    gossip: gossipEngine.getNetworkStats(),
    dht: dht.getStats(),
    network: peerNetwork.getNetworkStats(),
    dhtRing: dht.getRingVisualization().slice(0, 10),
    recentGossips: gossipEngine.getRecentPropagations(3),
  });
});

export default router;
