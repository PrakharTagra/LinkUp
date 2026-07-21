/**
 * ═══════════════════════════════════════════════════════════════
 *  GOSSIP PROTOCOL ENGINE — Shivalik Connect
 *  Epidemic-style data dissemination across peers
 * ═══════════════════════════════════════════════════════════════
 *
 *  How it works:
 *  1. A new event (post, notification) enters the network
 *  2. The origin node sends it to K random peers (fan-out)
 *  3. Each peer that receives it forwards to K more random peers
 *  4. After O(log N) rounds, all peers have the data
 *  5. Duplicates are suppressed via a "seen" set
 */

const FANOUT = 3;            // number of peers to gossip to per round
const MAX_ROUNDS = 10;       // max propagation rounds
const TTL_MS = 60_000;       // message expires after 60s

class GossipProtocol {
  constructor() {
    /** @type {Map<string, { id: string, name: string, skills: string[] }>} */
    this.peers = new Map();

    /** @type {Map<string, Set<string>>} peer connections (adjacency list) */
    this.connections = new Map();

    /** @type {Map<string, Set<string>>} messageId → set of peerIds who have seen it */
    this.seenMessages = new Map();

    /** @type {Array<object>} full gossip propagation log for visualization */
    this.propagationLog = [];
  }

  // ── Peer Management ────────────────────────────────────────

  /** Register a peer in the gossip network */
  addPeer(peerId, metadata = {}) {
    this.peers.set(peerId, { id: peerId, ...metadata });
    if (!this.connections.has(peerId)) {
      this.connections.set(peerId, new Set());
    }
    return { success: true, totalPeers: this.peers.size };
  }

  /** Remove a peer (they went offline) */
  removePeer(peerId) {
    this.peers.delete(peerId);
    this.connections.delete(peerId);
    // Remove from other peers' connections
    for (const [, neighbours] of this.connections) {
      neighbours.delete(peerId);
    }
  }

  /** Connect two peers (bidirectional) */
  connectPeers(peerA, peerB) {
    if (!this.connections.has(peerA)) this.connections.set(peerA, new Set());
    if (!this.connections.has(peerB)) this.connections.set(peerB, new Set());
    this.connections.get(peerA).add(peerB);
    this.connections.get(peerB).add(peerA);
  }

  // ── Core Gossip Algorithm ──────────────────────────────────

  /**
   * Initiate gossip from an origin peer.
   * Returns the full propagation trace (which peer told which peer, in which round).
   */
  gossip(originPeerId, message) {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Initialize seen set
    this.seenMessages.set(messageId, new Set([originPeerId]));

    const trace = [];
    let currentRound = [originPeerId];
    let round = 0;

    while (round < MAX_ROUNDS && currentRound.length > 0) {
      const nextRound = [];

      for (const senderId of currentRound) {
        // Pick K random peers that haven't seen this message
        const targets = this._selectGossipTargets(senderId, messageId);

        for (const targetId of targets) {
          // Mark as seen
          this.seenMessages.get(messageId).add(targetId);

          // Record the propagation step
          trace.push({
            round,
            from: senderId,
            to: targetId,
            fromName: this.peers.get(senderId)?.name || senderId,
            toName: this.peers.get(targetId)?.name || targetId,
            timestamp: Date.now(),
          });

          nextRound.push(targetId);
        }
      }

      currentRound = nextRound;
      round++;
    }

    const totalReached = this.seenMessages.get(messageId).size;
    const totalPeers = this.peers.size;

    const result = {
      messageId,
      message,
      originPeer: originPeerId,
      originName: this.peers.get(originPeerId)?.name || originPeerId,
      totalRounds: round,
      totalReached,
      totalPeers,
      coveragePercent: totalPeers > 0 ? Math.round((totalReached / totalPeers) * 100) : 0,
      trace,
      algorithm: "Gossip Protocol (Epidemic Dissemination)",
      complexity: `O(log ${totalPeers}) = ~${Math.ceil(Math.log2(totalPeers || 1))} rounds`,
    };

    // Store for visualization
    this.propagationLog.push(result);

    // Cleanup old messages
    this._cleanup();

    return result;
  }

  /**
   * Select K random peers to gossip to.
   * Prefers connected peers but falls back to random peers.
   */
  _selectGossipTargets(senderId, messageId) {
    const seen = this.seenMessages.get(messageId) || new Set();
    const connectedPeers = this.connections.get(senderId) || new Set();

    // Candidates = connected peers who haven't seen the message
    let candidates = [...connectedPeers].filter(id => !seen.has(id));

    // If not enough connected peers, add random unseen peers
    if (candidates.length < FANOUT) {
      const allUnseen = [...this.peers.keys()].filter(
        id => id !== senderId && !seen.has(id) && !candidates.includes(id)
      );
      candidates = [...candidates, ...allUnseen];
    }

    // Shuffle and pick FANOUT
    return this._shuffle(candidates).slice(0, FANOUT);
  }

  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  _cleanup() {
    // Keep only last 50 messages
    if (this.propagationLog.length > 50) {
      this.propagationLog = this.propagationLog.slice(-50);
    }
    // Remove old seen sets
    const now = Date.now();
    for (const [msgId] of this.seenMessages) {
      const ts = parseInt(msgId.split("_")[1]) || 0;
      if (now - ts > TTL_MS) {
        this.seenMessages.delete(msgId);
      }
    }
  }

  // ── Stats ──────────────────────────────────────────────────

  getNetworkStats() {
    let totalEdges = 0;
    for (const [, neighbours] of this.connections) {
      totalEdges += neighbours.size;
    }
    return {
      totalPeers: this.peers.size,
      totalConnections: totalEdges / 2, // bidirectional
      avgConnections: this.peers.size > 0
        ? (totalEdges / this.peers.size).toFixed(1)
        : 0,
      fanout: FANOUT,
      maxRounds: MAX_ROUNDS,
      recentGossips: this.propagationLog.length,
    };
  }

  getRecentPropagations(limit = 5) {
    return this.propagationLog.slice(-limit);
  }
}

// Singleton instance
const gossipEngine = new GossipProtocol();
export default gossipEngine;
