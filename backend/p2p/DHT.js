/**
 * ═══════════════════════════════════════════════════════════════
 *  DISTRIBUTED HASH TABLE (DHT) — Shivalik Connect
 *  Chord-inspired ring-based peer lookup
 * ═══════════════════════════════════════════════════════════════
 *
 *  How it works:
 *  1. Each peer and each search key is hashed to a position on a ring [0, RING_SIZE)
 *  2. Each peer is responsible for keys closest to its position
 *  3. Lookups route through O(log N) hops using a finger table
 *  4. Result: decentralized search without a central index
 */

const RING_BITS = 8;                        // 2^8 = 256 positions
const RING_SIZE = Math.pow(2, RING_BITS);   // 256

class DHTNode {
  constructor(id, metadata = {}) {
    this.id = id;
    this.position = DHTNode.hash(id);
    this.metadata = metadata;             // { name, skills, company, ... }
    this.data = new Map();                 // keys this node is responsible for
    this.fingerTable = [];                 // routing shortcuts
  }

  /** Simple hash: string → [0, RING_SIZE) */
  static hash(key) {
    let h = 0;
    const str = String(key);
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) & 0xFFFFFFFF;
    }
    return Math.abs(h) % RING_SIZE;
  }
}

class DistributedHashTable {
  constructor() {
    /** @type {Map<string, DHTNode>} */
    this.nodes = new Map();

    /** @type {DHTNode[]} sorted by position on the ring */
    this.ring = [];

    /** @type {Array<object>} lookup trace log */
    this.lookupLog = [];
  }

  // ── Node Management ────────────────────────────────────────

  /** Add a peer to the DHT ring */
  addNode(peerId, metadata = {}) {
    if (this.nodes.has(peerId)) return this.nodes.get(peerId);

    const node = new DHTNode(peerId, metadata);
    this.nodes.set(peerId, node);
    this.ring.push(node);
    this.ring.sort((a, b) => a.position - b.position);

    // Rebuild finger tables for all nodes
    this._rebuildFingerTables();

    // Redistribute data keys
    this._redistributeKeys();

    return {
      nodeId: peerId,
      position: node.position,
      ringSize: RING_SIZE,
      totalNodes: this.nodes.size,
    };
  }

  /** Remove a peer from the ring */
  removeNode(peerId) {
    const node = this.nodes.get(peerId);
    if (!node) return;

    this.nodes.delete(peerId);
    this.ring = this.ring.filter(n => n.id !== peerId);
    this._rebuildFingerTables();
    this._redistributeKeys();
  }

  /** Store a searchable item (e.g., alumni profile) in the DHT */
  store(key, value) {
    if (this.ring.length === 0) return null;

    const keyHash = DHTNode.hash(key);
    const responsible = this._findSuccessor(keyHash);
    responsible.data.set(key, value);

    return {
      key,
      keyHash,
      storedAt: responsible.id,
      storedAtPosition: responsible.position,
    };
  }

  // ── Core DHT Lookup ────────────────────────────────────────

  /**
   * Look up a key in the DHT.
   * Returns the value + full routing trace showing O(log N) hops.
   */
  lookup(key, startNodeId = null) {
    if (this.ring.length === 0) {
      return { found: false, key, hops: [], error: "No nodes in DHT" };
    }

    const keyHash = DHTNode.hash(key);
    const startNode = startNodeId
      ? this.nodes.get(startNodeId)
      : this.ring[0];

    if (!startNode) {
      return { found: false, key, hops: [], error: "Start node not found" };
    }

    const hops = [];
    let current = startNode;
    let hopCount = 0;
    const visited = new Set();

    while (hopCount < this.ring.length + 1) {
      visited.add(current.id);

      // Check if this node has the key
      if (current.data.has(key)) {
        hops.push({
          hop: hopCount,
          nodeId: current.id,
          nodeName: current.metadata.name || current.id,
          position: current.position,
          action: "FOUND — key exists on this node",
        });

        const result = {
          found: true,
          key,
          keyHash,
          value: current.data.get(key),
          totalHops: hopCount,
          maxPossibleHops: Math.ceil(Math.log2(this.ring.length || 1)),
          hops,
          algorithm: "DHT Chord Lookup",
          complexity: `O(log ${this.ring.length}) = ~${Math.ceil(Math.log2(this.ring.length || 1))} hops`,
        };

        this.lookupLog.push(result);
        return result;
      }

      // Use finger table to find the closest preceding node
      const nextNode = this._closestPrecedingNode(current, keyHash);

      hops.push({
        hop: hopCount,
        nodeId: current.id,
        nodeName: current.metadata.name || current.id,
        position: current.position,
        action: nextNode.id === current.id
          ? "No closer node found, checking successor"
          : `Routing to closer node: ${nextNode.metadata.name || nextNode.id}`,
      });

      // If we can't make progress, go to successor
      if (nextNode.id === current.id || visited.has(nextNode.id)) {
        const successor = this._findSuccessor(keyHash);
        if (visited.has(successor.id)) break;
        current = successor;
      } else {
        current = nextNode;
      }

      hopCount++;
    }

    // Key not found
    const result = {
      found: false,
      key,
      keyHash,
      totalHops: hopCount,
      hops,
      algorithm: "DHT Chord Lookup",
      complexity: `O(log ${this.ring.length})`,
    };

    this.lookupLog.push(result);
    return result;
  }

  /**
   * Search alumni by skill using DHT.
   * Stores alumni profiles by skill keys, then looks them up.
   */
  searchBySkill(skill) {
    const normalizedSkill = skill.toLowerCase().trim();
    const result = this.lookup(`skill:${normalizedSkill}`);

    return {
      skill: normalizedSkill,
      ...result,
      matchingAlumni: result.found ? result.value : [],
    };
  }

  // ── Internal Helpers ───────────────────────────────────────

  /** Find the node responsible for a given key hash (successor) */
  _findSuccessor(keyHash) {
    if (this.ring.length === 0) return null;

    for (const node of this.ring) {
      if (node.position >= keyHash) return node;
    }
    // Wrap around
    return this.ring[0];
  }

  /** Find the closest preceding node using finger table */
  _closestPrecedingNode(node, keyHash) {
    // Walk finger table from farthest to nearest
    for (let i = node.fingerTable.length - 1; i >= 0; i--) {
      const finger = node.fingerTable[i];
      if (finger && this._isBetween(finger.position, node.position, keyHash)) {
        return finger;
      }
    }
    return node;
  }

  /** Check if pos is in (start, end) on the ring */
  _isBetween(pos, start, end) {
    if (start < end) return pos > start && pos < end;
    return pos > start || pos < end; // wrap-around
  }

  /** Rebuild finger tables for all nodes */
  _rebuildFingerTables() {
    for (const node of this.ring) {
      node.fingerTable = [];
      for (let i = 0; i < RING_BITS; i++) {
        const target = (node.position + Math.pow(2, i)) % RING_SIZE;
        const successor = this._findSuccessor(target);
        if (successor && successor.id !== node.id) {
          node.fingerTable.push(successor);
        }
      }
    }
  }

  /** Redistribute stored keys after ring changes */
  _redistributeKeys() {
    if (this.ring.length === 0) return;

    // Collect all key-value pairs
    const allData = [];
    for (const node of this.ring) {
      for (const [k, v] of node.data) {
        allData.push([k, v]);
      }
      node.data.clear();
    }

    // Re-store each key to the correct node
    for (const [k, v] of allData) {
      const keyHash = DHTNode.hash(k);
      const responsible = this._findSuccessor(keyHash);
      if (responsible) responsible.data.set(k, v);
    }
  }

  // ── Stats & Visualization ──────────────────────────────────

  getRingVisualization() {
    return this.ring.map(node => ({
      id: node.id,
      name: node.metadata.name || node.id,
      position: node.position,
      ringSize: RING_SIZE,
      keysStored: node.data.size,
      fingerTableSize: node.fingerTable.length,
      fingers: node.fingerTable.map(f => ({
        id: f.id,
        name: f.metadata.name || f.id,
        position: f.position,
      })),
    }));
  }

  getStats() {
    let totalKeys = 0;
    for (const node of this.ring) {
      totalKeys += node.data.size;
    }
    return {
      totalNodes: this.ring.length,
      ringSize: RING_SIZE,
      totalKeysStored: totalKeys,
      avgKeysPerNode: this.ring.length > 0
        ? (totalKeys / this.ring.length).toFixed(1)
        : 0,
      lookupComplexity: `O(log ${this.ring.length}) = ~${Math.ceil(Math.log2(this.ring.length || 1))} hops`,
      recentLookups: this.lookupLog.length,
    };
  }

  getRecentLookups(limit = 5) {
    return this.lookupLog.slice(-limit);
  }
}

// Singleton
const dht = new DistributedHashTable();
export default dht;
