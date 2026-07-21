/**
 * ═══════════════════════════════════════════════════════════════
 *  PEER NETWORK MANAGER — Shivalik Connect
 *  Manages peer discovery, connection tracking, and P2P stats
 * ═══════════════════════════════════════════════════════════════
 */

class PeerNetwork {
  constructor() {
    /** @type {Map<string, object>} online peers */
    this.onlinePeers = new Map();

    /** @type {Map<string, Set<string>>} peer adjacency */
    this.adjacency = new Map();

    /** @type {Array<object>} event log */
    this.events = [];
  }

  /** Register a peer as online */
  registerPeer(peerId, metadata = {}) {
    this.onlinePeers.set(peerId, {
      id: peerId,
      ...metadata,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
    });
    if (!this.adjacency.has(peerId)) {
      this.adjacency.set(peerId, new Set());
    }
    this._log("PEER_JOIN", peerId, metadata);
    return { peerId, totalOnline: this.onlinePeers.size };
  }

  /** Remove a peer */
  unregisterPeer(peerId) {
    this.onlinePeers.delete(peerId);
    this.adjacency.delete(peerId);
    for (const [, neighbours] of this.adjacency) {
      neighbours.delete(peerId);
    }
    this._log("PEER_LEAVE", peerId);
  }

  /** Establish a bidirectional peer link */
  link(peerA, peerB) {
    if (!this.adjacency.has(peerA)) this.adjacency.set(peerA, new Set());
    if (!this.adjacency.has(peerB)) this.adjacency.set(peerB, new Set());
    this.adjacency.get(peerA).add(peerB);
    this.adjacency.get(peerB).add(peerA);
    this._log("PEER_LINK", peerA, { linkedTo: peerB });
  }

  /** Get neighbours of a peer */
  getNeighbours(peerId) {
    return [...(this.adjacency.get(peerId) || [])];
  }

  /**
   * BFS-based shortest path between two peers.
   * Used for "introduction chains" — how to reach an alumni through mutual connections.
   */
  findShortestPath(fromId, toId) {
    if (fromId === toId) return { path: [fromId], hops: 0 };

    const visited = new Set([fromId]);
    const queue = [[fromId]];

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      const neighbours = this.adjacency.get(current) || new Set();

      for (const neighbour of neighbours) {
        if (neighbour === toId) {
          const fullPath = [...path, neighbour];
          return {
            path: fullPath,
            hops: fullPath.length - 1,
            nodes: fullPath.map(id => ({
              id,
              name: this.onlinePeers.get(id)?.name || id,
            })),
          };
        }
        if (!visited.has(neighbour)) {
          visited.add(neighbour);
          queue.push([...path, neighbour]);
        }
      }
    }

    return { path: [], hops: -1, message: "No path found — peers are not connected" };
  }

  /** Find bridge nodes (peers whose removal disconnects the network) */
  findBridgeNodes() {
    const bridges = [];
    const allPeers = [...this.adjacency.keys()];

    for (const peer of allPeers) {
      // Temporarily remove peer and check connectivity
      const savedNeighbours = this.adjacency.get(peer);
      this.adjacency.delete(peer);
      for (const [, neighbours] of this.adjacency) {
        neighbours.delete(peer);
      }

      // Check if remaining graph is still connected
      const remaining = [...this.adjacency.keys()];
      if (remaining.length > 0) {
        const reachable = this._bfs(remaining[0]);
        if (reachable.size < remaining.length) {
          bridges.push({
            id: peer,
            name: this.onlinePeers.get(peer)?.name || peer,
            connectionCount: savedNeighbours?.size || 0,
          });
        }
      }

      // Restore peer
      this.adjacency.set(peer, savedNeighbours);
      for (const neighbour of savedNeighbours) {
        if (this.adjacency.has(neighbour)) {
          this.adjacency.get(neighbour).add(peer);
        }
      }
    }

    return bridges;
  }

  _bfs(startId) {
    const visited = new Set([startId]);
    const queue = [startId];
    while (queue.length > 0) {
      const current = queue.shift();
      for (const neighbour of (this.adjacency.get(current) || [])) {
        if (!visited.has(neighbour)) {
          visited.add(neighbour);
          queue.push(neighbour);
        }
      }
    }
    return visited;
  }

  _log(type, peerId, data = {}) {
    this.events.push({ type, peerId, data, timestamp: Date.now() });
    if (this.events.length > 200) this.events = this.events.slice(-100);
  }

  /** Full network stats */
  getNetworkStats() {
    let totalEdges = 0;
    for (const [, neighbours] of this.adjacency) {
      totalEdges += neighbours.size;
    }
    return {
      onlinePeers: this.onlinePeers.size,
      totalConnections: totalEdges / 2,
      avgDegree: this.onlinePeers.size > 0
        ? (totalEdges / this.onlinePeers.size).toFixed(1)
        : 0,
      peerList: [...this.onlinePeers.values()].map(p => ({
        id: p.id,
        name: p.name,
        neighbours: (this.adjacency.get(p.id) || new Set()).size,
      })),
      recentEvents: this.events.slice(-10),
    };
  }
}

const peerNetwork = new PeerNetwork();
export default peerNetwork;
