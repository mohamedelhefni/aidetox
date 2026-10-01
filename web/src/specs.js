// Language-neutral specs + tests for the portable build-from-scratch days.

// Test helper: t(ctorArgs, [[method, args, expected], ...]) for class problems.
const t = (ctor, steps) => ({ ctor, calls: steps.map(([m, a]) => [m, a]), expected: steps.map(s => s[2]) });
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);
const m = (name, params, returns) => ({ name, params, returns });
// WAL frame for test data: [len u32 BE][UTF-8 payload][sum of payload bytes mod 256].
const frame = s => {
  const b = [...new TextEncoder().encode(s)];
  return [b.length >>> 24, (b.length >>> 16) & 255, (b.length >>> 8) & 255, b.length & 255, ...b, b.reduce((a, x) => a + x, 0) % 256];
};

export const SPECS = {
  '01-linked-list': {
    brief: `Build a **doubly linked list** of integers from nodes with \`prev\`/\`next\` pointers. Keep \`head\` and \`tail\` so both ends are O(1). No built-in list/deque types.

- \`popFront\`, \`popBack\`, \`front\`, \`back\` return **-1** when the list is empty.
- \`remove\`, \`moveToFront\`, \`moveToBack\` act on the **first node holding that value** and return false if there is none.
- \`toArray\` returns the values head → tail.

Before coding, write down the head/tail and prev/next invariants and check them for the empty and one-node cases.`,
    kind: 'class',
    class: { name: 'LinkedList', ctor: [], methods: [
      m('pushFront', [['value', 'int']], 'void'), m('pushBack', [['value', 'int']], 'void'),
      m('popFront', [], 'int'), m('popBack', [], 'int'), m('front', [], 'int'), m('back', [], 'int'),
      m('remove', [['value', 'int']], 'bool'), m('moveToFront', [['value', 'int']], 'bool'), m('moveToBack', [['value', 'int']], 'bool'),
      m('size', [], 'int'), m('toArray', [], 'int[]'),
    ] },
    tests: [
      t([], [['size', [], 0], ['front', [], -1], ['back', [], -1], ['popFront', [], -1], ['popBack', [], -1], ['toArray', [], []]]),
      t([], [['pushBack', [1], null], ['pushBack', [2], null], ['pushFront', [0], null], ['toArray', [], [0, 1, 2]], ['size', [], 3], ['front', [], 0], ['back', [], 2]]),
      t([], [...[1, 2, 3, 4].map(v => ['pushBack', [v], null]), ['remove', [1], true], ['remove', [4], true], ['remove', [9], false], ['toArray', [], [2, 3]], ['remove', [2], true], ['remove', [3], true], ['size', [], 0], ['front', [], -1], ['back', [], -1]]),
      t([], [...[1, 2, 3].map(v => ['pushBack', [v], null]), ['moveToFront', [3], true], ['toArray', [], [3, 1, 2]], ['moveToBack', [3], true], ['toArray', [], [1, 2, 3]], ['moveToFront', [1], true], ['toArray', [], [1, 2, 3]], ['moveToBack', [5], false], ['back', [], 3]]),
      t([], [...[1, 2, 3].map(v => ['pushBack', [v], null]), ['popFront', [], 1], ['popBack', [], 3], ['popBack', [], 2], ['popBack', [], -1], ['pushFront', [7], null], ['toArray', [], [7]], ['front', [], 7], ['back', [], 7]]),
      t([], [['pushFront', [5], null], ['remove', [5], true], ['toArray', [], []], ['pushBack', [6], null], ['front', [], 6], ['back', [], 6]]),
    ],
  },

  '02-ring-buffer': {
    brief: `Build a fixed-capacity **ring buffer** (circular FIFO queue) over a fixed-size array with head/tail indexes and modulo wrap-around. Popping must not shift the remaining elements.

- \`push\` returns **false** when the buffer is full (nothing is overwritten).
- \`pop\` and \`peek\` return **-1** when empty.
- Capacity 0 is legal: the buffer is both empty and full.`,
    kind: 'class',
    class: { name: 'RingBuffer', ctor: [['capacity', 'int']], methods: [
      m('push', [['value', 'int']], 'bool'), m('pop', [], 'int'), m('peek', [], 'int'),
      m('size', [], 'int'), m('capacity', [], 'int'), m('isFull', [], 'bool'), m('isEmpty', [], 'bool'),
    ] },
    tests: [
      t([3], [['isEmpty', [], true], ['push', [1], true], ['push', [2], true], ['push', [3], true], ['isFull', [], true], ['push', [4], false], ['peek', [], 1], ['pop', [], 1], ['size', [], 2], ['capacity', [], 3]]),
      t([2], [['push', [1], true], ['push', [2], true], ['pop', [], 1], ['push', [3], true], ['pop', [], 2], ['push', [4], true], ['pop', [], 3], ['pop', [], 4], ['pop', [], -1], ['isEmpty', [], true]]),
      t([1], [['push', [9], true], ['isFull', [], true], ['push', [8], false], ['pop', [], 9], ['isEmpty', [], true], ['push', [8], true], ['peek', [], 8]]),
      t([0], [['push', [1], false], ['isFull', [], true], ['isEmpty', [], true], ['pop', [], -1], ['size', [], 0]]),
      t([3], [['push', [1], true], ['push', [2], true], ['push', [3], true], ['pop', [], 1], ['pop', [], 2], ['push', [4], true], ['push', [5], true], ['isFull', [], true], ['pop', [], 3], ['pop', [], 4], ['pop', [], 5], ['size', [], 0]]),
    ],
  },

  '03-dynamic-array': {
    brief: `Pretend arrays can't grow. Build a **dynamic array** of integers on top of fixed-size storage.

- Capacity starts at **0**. When an insert finds the array full, allocate \`max(1, 2 × capacity)\` and copy the elements over. Shrinking is not required.
- \`get\` returns **-1** for an invalid index; \`set\`, \`insert\`, \`removeAt\` return **false**.
- \`insert(index, value)\` accepts \`0 ≤ index ≤ size\` and shifts later elements right; \`removeAt\` shifts them left.

Be ready to explain why \`append\` is amortized O(1).`,
    kind: 'class',
    class: { name: 'DynamicArray', ctor: [], methods: [
      m('append', [['value', 'int']], 'void'), m('get', [['index', 'int']], 'int'), m('set', [['index', 'int'], ['value', 'int']], 'bool'),
      m('insert', [['index', 'int'], ['value', 'int']], 'bool'), m('removeAt', [['index', 'int']], 'bool'),
      m('size', [], 'int'), m('capacity', [], 'int'), m('toArray', [], 'int[]'),
    ] },
    tests: [
      t([], [['capacity', [], 0], ['size', [], 0], ['append', [1], null], ['capacity', [], 1], ['append', [2], null], ['capacity', [], 2], ['append', [3], null], ['capacity', [], 4], ['append', [4], null], ['capacity', [], 4], ['append', [5], null], ['capacity', [], 8], ['toArray', [], [1, 2, 3, 4, 5]]]),
      t([], [['append', [10], null], ['append', [20], null], ['append', [30], null], ['get', [0], 10], ['get', [2], 30], ['get', [3], -1], ['get', [-1], -1], ['set', [1, 21], true], ['set', [3, 5], false], ['toArray', [], [10, 21, 30]]]),
      t([], [['insert', [0, 5], true], ['insert', [0, 4], true], ['insert', [2, 7], true], ['insert', [1, 9], true], ['insert', [9, 1], false], ['insert', [-1, 1], false], ['toArray', [], [4, 9, 5, 7]]]),
      t([], [...[1, 2, 3, 4].map(v => ['append', [v], null]), ['removeAt', [0], true], ['toArray', [], [2, 3, 4]], ['removeAt', [2], true], ['toArray', [], [2, 3]], ['removeAt', [5], false], ['removeAt', [0], true], ['removeAt', [0], true], ['size', [], 0], ['removeAt', [0], false], ['toArray', [], []]]),
      t([], [...range(0, 10).map(v => ['append', [v], null]), ['toArray', [], range(0, 10)], ['size', [], 10], ['capacity', [], 16]]),
    ],
  },

  '04-hash-table': {
    brief: `Build a \`string → string\` **hash table** with separate chaining — no built-in map/dict/object-as-map. Write your own hash function (e.g. FNV-1a or polynomial), keep an array of buckets, and **resize + rehash** when the load factor exceeds 0.75.

- \`get\` returns \`""\` for a missing key.
- \`set\` on an existing key updates the value without changing \`size\`.
- \`remove\` returns whether the key existed.

The tests can't see your internals — the no-built-in-map rule is on your honor.`,
    kind: 'class',
    class: { name: 'HashTable', ctor: [], methods: [
      m('set', [['key', 'string'], ['value', 'string']], 'void'), m('get', [['key', 'string']], 'string'),
      m('remove', [['key', 'string']], 'bool'), m('contains', [['key', 'string']], 'bool'), m('size', [], 'int'),
    ] },
    tests: [
      t([], [['set', ['a', '1'], null], ['set', ['b', '2'], null], ['get', ['a'], '1'], ['get', ['b'], '2'], ['get', ['c'], ''], ['size', [], 2], ['contains', ['a'], true], ['contains', ['c'], false]]),
      t([], [['set', ['k', 'v1'], null], ['set', ['k', 'v2'], null], ['get', ['k'], 'v2'], ['size', [], 1]]),
      t([], [['set', ['x', '1'], null], ['remove', ['x'], true], ['remove', ['x'], false], ['contains', ['x'], false], ['size', [], 0], ['get', ['x'], '']]),
      t([], [...range(0, 50).map(i => ['set', ['k' + i, 'v' + i], null]), ['get', ['k0'], 'v0'], ['get', ['k25'], 'v25'], ['get', ['k49'], 'v49'], ['size', [], 50], ['remove', ['k10'], true], ['size', [], 49], ['get', ['k10'], ''], ['get', ['k11'], 'v11']]),
      t([], [['set', ['', 'empty'], null], ['get', [''], 'empty'], ['contains', [''], true], ['size', [], 1]]),
    ],
  },

  '06-bst': {
    brief: `Build a **binary search tree** of integers with \`left < node < right\`.

- \`insert\` returns **false** for a duplicate (duplicates are ignored).
- \`min\`/\`max\` return **-1** on an empty tree.
- \`remove\` of a node with two children replaces it with its **in-order successor** (smallest value in the right subtree) — the pre-order tests depend on this.
- Traversals return values in the stated order.

Test deleting a leaf, a node with one child, a node with two children, and the root.`,
    kind: 'class',
    class: { name: 'BST', ctor: [], methods: [
      m('insert', [['value', 'int']], 'bool'), m('contains', [['value', 'int']], 'bool'), m('remove', [['value', 'int']], 'bool'),
      m('min', [], 'int'), m('max', [], 'int'), m('inOrder', [], 'int[]'), m('preOrder', [], 'int[]'), m('postOrder', [], 'int[]'),
    ] },
    tests: [
      t([], [['min', [], -1], ['max', [], -1], ['inOrder', [], []], ['contains', [1], false], ['remove', [1], false]]),
      t([], [...[5, 3, 8, 1, 4, 7, 9].map(v => ['insert', [v], true]), ['insert', [5], false], ['inOrder', [], [1, 3, 4, 5, 7, 8, 9]], ['preOrder', [], [5, 3, 1, 4, 8, 7, 9]], ['postOrder', [], [1, 4, 3, 7, 9, 8, 5]], ['min', [], 1], ['max', [], 9], ['contains', [4], true], ['contains', [6], false]]),
      t([], [...[5, 3, 8, 1, 4, 7, 9].map(v => ['insert', [v], true]), ['remove', [1], true], ['preOrder', [], [5, 3, 4, 8, 7, 9]], ['remove', [3], true], ['preOrder', [], [5, 4, 8, 7, 9]], ['remove', [8], true], ['preOrder', [], [5, 4, 9, 7]], ['inOrder', [], [4, 5, 7, 9]]]),
      t([], [...[5, 3, 8, 6].map(v => ['insert', [v], true]), ['remove', [5], true], ['preOrder', [], [6, 3, 8]], ['remove', [6], true], ['preOrder', [], [8, 3]], ['remove', [8], true], ['preOrder', [], [3]], ['remove', [3], true], ['inOrder', [], []], ['min', [], -1]]),
      t([], [...[1, 2, 3, 4, 5].map(v => ['insert', [v], true]), ['inOrder', [], [1, 2, 3, 4, 5]], ['preOrder', [], [1, 2, 3, 4, 5]], ['postOrder', [], [5, 4, 3, 2, 1]], ['max', [], 5], ['remove', [1], true], ['min', [], 2]]),
    ],
  },

  '07-heap': {
    brief: `Build a **binary min-heap** over a plain array using index arithmetic (\`parent = (i-1)/2\`, children \`2i+1\`, \`2i+2\`). No tree nodes, no built-in heap/priority queue.

- \`pop\` and \`peek\` return **-1** when empty.
- \`push\`/\`pop\` are O(log n) via bubble-up / bubble-down; \`peek\` is O(1).`,
    kind: 'class',
    class: { name: 'MinHeap', ctor: [], methods: [m('push', [['value', 'int']], 'void'), m('pop', [], 'int'), m('peek', [], 'int'), m('size', [], 'int')] },
    tests: [
      t([], [['size', [], 0], ['peek', [], -1], ['pop', [], -1]]),
      t([], [...[5, 3, 8, 1, 4].map(v => ['push', [v], null]), ['peek', [], 1], ...[1, 3, 4, 5, 8].map(v => ['pop', [], v]), ['pop', [], -1]]),
      t([], [...[2, 2, 1, 1].map(v => ['push', [v], null]), ...[1, 1, 2, 2].map(v => ['pop', [], v])]),
      t([], [...[5, 4, 3, 2, 1].map(v => ['push', [v], null]), ...[1, 2, 3, 4, 5].map(v => ['pop', [], v])]),
      t([], [['push', [3], null], ['push', [1], null], ['pop', [], 1], ['push', [2], null], ['peek', [], 2], ['push', [0], null], ['pop', [], 0], ['pop', [], 2], ['pop', [], 3], ['size', [], 0]]),
    ],
  },

  '08-priority-queue': {
    brief: `Build a **priority queue** of named jobs on top of your own binary heap (retype it — no built-in heap).

- **Lower priority numbers run first.**
- Jobs with equal priority come out in **FIFO order** (hint: a heap alone isn't stable — store an insertion counter).
- \`dequeue\` and \`peek\` return \`""\` when empty.`,
    kind: 'class',
    class: { name: 'PriorityQueue', ctor: [], methods: [
      m('enqueue', [['name', 'string'], ['priority', 'int']], 'void'), m('dequeue', [], 'string'), m('peek', [], 'string'), m('size', [], 'int'),
    ] },
    tests: [
      t([], [['dequeue', [], ''], ['peek', [], ''], ['size', [], 0]]),
      t([], [['enqueue', ['email', 3], null], ['enqueue', ['deploy', 1], null], ['enqueue', ['lunch', 5], null], ['enqueue', ['review', 2], null], ['peek', [], 'deploy'], ...['deploy', 'review', 'email', 'lunch', ''].map(v => ['dequeue', [], v])]),
      t([], [['enqueue', ['a', 1], null], ['enqueue', ['b', 1], null], ['enqueue', ['c', 1], null], ['enqueue', ['d', 0], null], ...['d', 'a', 'b', 'c'].map(v => ['dequeue', [], v])]),
      t([], [['enqueue', ['x', 2], null], ['enqueue', ['y', 1], null], ['dequeue', [], 'y'], ['enqueue', ['z', 1], null], ['enqueue', ['w', 2], null], ['dequeue', [], 'z'], ['dequeue', [], 'x'], ['dequeue', [], 'w'], ['size', [], 0]]),
    ],
  },

  '09-trie': {
    brief: `Build a **trie** (prefix tree) of lowercase ASCII words.

- \`remove\` returns whether the word was present, and prunes nodes no other word needs — after removing the last word under a prefix, \`startsWith(prefix)\` is false.
- \`wordsWithPrefix\` returns every stored word with that prefix, **sorted**.
- The empty string is a valid word.`,
    kind: 'class',
    class: { name: 'Trie', ctor: [], methods: [
      m('insert', [['word', 'string']], 'void'), m('contains', [['word', 'string']], 'bool'), m('startsWith', [['prefix', 'string']], 'bool'),
      m('remove', [['word', 'string']], 'bool'), m('wordsWithPrefix', [['prefix', 'string']], 'string[]'),
    ] },
    tests: [
      t([], [...['car', 'cart', 'care', 'dog'].map(w => ['insert', [w], null]), ['contains', ['car'], true], ['contains', ['ca'], false], ['startsWith', ['ca'], true], ['startsWith', ['do'], true], ['startsWith', ['cat'], false], ['wordsWithPrefix', ['car'], ['car', 'care', 'cart']], ['wordsWithPrefix', ['x'], []]]),
      t([], [['insert', ['car'], null], ['insert', ['cart'], null], ['remove', ['car'], true], ['contains', ['car'], false], ['contains', ['cart'], true], ['startsWith', ['car'], true], ['remove', ['car'], false], ['remove', ['cart'], true], ['startsWith', ['c'], false], ['wordsWithPrefix', [''], []]]),
      t([], [['insert', [''], null], ['contains', [''], true], ['startsWith', [''], true], ['wordsWithPrefix', [''], ['']], ['remove', [''], true], ['contains', [''], false]]),
      t([], [...['a', 'ab', 'abc'].map(w => ['insert', [w], null]), ['remove', ['abc'], true], ['startsWith', ['abc'], false], ['contains', ['ab'], true], ['wordsWithPrefix', ['a'], ['a', 'ab']], ['remove', ['b'], false]]),
    ],
  },

  '10-union-find': {
    brief: `Build **union-find** (disjoint set) over elements \`0 … n-1\`. Get a naive parent-array version passing first, then add **path compression** and **union by rank or size**.

- \`unite(a, b)\` returns **true** if it merged two different sets, false if they were already connected.
- \`count\` is the number of disjoint sets.

(Called \`unite\` because \`union\` is a keyword in C++.)`,
    kind: 'class',
    class: { name: 'UnionFind', ctor: [['n', 'int']], methods: [
      m('unite', [['a', 'int'], ['b', 'int']], 'bool'), m('connected', [['a', 'int'], ['b', 'int']], 'bool'), m('count', [], 'int'),
    ] },
    tests: [
      t([5], [['count', [], 5], ['connected', [0, 1], false], ['connected', [2, 2], true]]),
      t([6], [['unite', [0, 1], true], ['unite', [1, 2], true], ['connected', [0, 2], true], ['unite', [0, 2], false], ['count', [], 4], ['unite', [3, 4], true], ['connected', [2, 3], false], ['unite', [2, 4], true], ['connected', [0, 3], true], ['count', [], 2]]),
      t([3], [['unite', [1, 1], false], ['count', [], 3]]),
      t([10], [...range(0, 9).map(i => ['unite', [i, i + 1], true]), ['count', [], 1], ['connected', [0, 9], true]]),
    ],
  },

  '11-graph': {
    brief: `Build an **adjacency-list graph** over integer vertices, directed or undirected (chosen at construction).

- \`addEdge\` creates missing vertices and returns **false** for a duplicate edge. In an undirected graph it links both ways; a self-edge appears once.
- \`neighbors\` returns vertices in **edge insertion order**, or \`[]\` for an unknown vertex. Return a copy — callers must not be able to corrupt your adjacency list.
- \`addVertex\` returns false if the vertex exists.`,
    kind: 'class',
    class: { name: 'Graph', ctor: [['directed', 'bool']], methods: [
      m('addVertex', [['v', 'int']], 'bool'), m('addEdge', [['u', 'int'], ['v', 'int']], 'bool'), m('removeEdge', [['u', 'int'], ['v', 'int']], 'bool'),
      m('hasEdge', [['u', 'int'], ['v', 'int']], 'bool'), m('neighbors', [['v', 'int']], 'int[]'), m('vertexCount', [], 'int'),
    ] },
    tests: [
      t([true], [['addEdge', [1, 2], true], ['hasEdge', [1, 2], true], ['hasEdge', [2, 1], false], ['neighbors', [1], [2]], ['neighbors', [2], []], ['vertexCount', [], 2], ['addEdge', [1, 2], false], ['addEdge', [1, 3], true], ['neighbors', [1], [2, 3]]]),
      t([false], [['addEdge', [1, 2], true], ['hasEdge', [2, 1], true], ['neighbors', [2], [1]], ['addEdge', [2, 1], false], ['removeEdge', [2, 1], true], ['hasEdge', [1, 2], false], ['neighbors', [1], []], ['removeEdge', [1, 2], false]]),
      t([true], [['addVertex', [5], true], ['addVertex', [5], false], ['neighbors', [5], []], ['neighbors', [9], []], ['vertexCount', [], 1], ['removeEdge', [5, 9], false]]),
      t([false], [['addEdge', [3, 3], true], ['neighbors', [3], [3]], ['addEdge', [3, 3], false], ['removeEdge', [3, 3], true], ['neighbors', [3], []]]),
      t([true], [['addEdge', [0, 3], true], ['addEdge', [0, 1], true], ['addEdge', [0, 2], true], ['neighbors', [0], [3, 1, 2]], ['removeEdge', [0, 1], true], ['neighbors', [0], [3, 2]], ['addEdge', [0, 1], true], ['neighbors', [0], [3, 2, 1]]]),
    ],
  },

  '12-bfs-dfs': {
    brief: `Given a **directed** graph of \`n\` vertices and an edge list, implement traversals. Build the adjacency list in the constructor (edge order = neighbor order).

- \`bfs(start)\` returns vertices in breadth-first order.
- \`dfs(start)\` returns the **recursive pre-order** (visit a vertex, then recurse into each unvisited neighbor in order).
- An out-of-range \`start\` returns \`[]\`. \`pathExists(a, a)\` is true.

Trace a small graph by hand (queue/stack, visited set) before coding. Both traversals are O(V + E).`,
    kind: 'class',
    class: { name: 'Graph', ctor: [['n', 'int'], ['edges', 'int[][]']], methods: [
      m('bfs', [['start', 'int']], 'int[]'), m('dfs', [['start', 'int']], 'int[]'), m('pathExists', [['a', 'int'], ['b', 'int']], 'bool'),
    ] },
    tests: [
      t([6, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]]], [['bfs', [0], [0, 1, 2, 3, 4]], ['dfs', [0], [0, 1, 3, 4, 2]], ['pathExists', [0, 4], true], ['pathExists', [4, 0], false], ['pathExists', [0, 5], false], ['bfs', [5], [5]]]),
      t([3, [[0, 1], [1, 2], [2, 0]]], [['bfs', [1], [1, 2, 0]], ['dfs', [2], [2, 0, 1]], ['pathExists', [2, 1], true]]),
      t([2, []], [['pathExists', [1, 1], true], ['bfs', [0], [0]], ['dfs', [9], []], ['bfs', [-1], []]]),
      t([5, [[0, 4], [0, 1], [1, 2], [4, 3], [3, 2]]], [['bfs', [0], [0, 4, 1, 3, 2]], ['dfs', [0], [0, 4, 3, 2, 1]]]),
    ],
  },

  '13-dijkstra': {
    brief: `Implement **Dijkstra's shortest path** on a directed graph with non-negative weights. \`edges[i] = [from, to, weight]\`.

Return the vertices on the cheapest path from \`source\` to \`target\` (inclusive), \`[source]\` when they are equal, or \`[]\` when \`target\` is unreachable. Every test has a unique shortest path.

Use a priority queue (your own heap, retyped) and handle **stale entries** — a vertex can be pushed more than once before it's settled. Pseudocode is fine; implementations are not.`,
    kind: 'fn',
    fn: { name: 'shortestPath', params: [['n', 'int'], ['edges', 'int[][]'], ['source', 'int'], ['target', 'int']], returns: 'int[]' },
    tests: [
      { args: [5, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5], [3, 4, 3]], 0, 4], expected: [0, 2, 1, 3, 4] },
      { args: [3, [[0, 1, 1]], 0, 2], expected: [] },
      { args: [2, [], 1, 1], expected: [1] },
      { args: [4, [[0, 1, 10], [0, 2, 1], [2, 1, 1], [1, 3, 1], [2, 3, 20]], 0, 3], expected: [0, 2, 1, 3] },
      { args: [3, [[0, 2, 5], [0, 1, 1], [1, 2, 1]], 0, 2], expected: [0, 1, 2] },
      { args: [3, [[0, 1, 0], [1, 2, 0], [0, 2, 1]], 0, 2], expected: [0, 1, 2] },
    ],
  },

  '14-topological-sort': {
    brief: `Return a **topological order** of vertices \`0 … n-1\` for a directed graph (\`[from, to]\` means \`from\` must come before \`to\`), or \`[]\` if the graph has a cycle.

Any valid order passes — the tests check that every edge points forward. Pick Kahn's algorithm (in-degrees + queue) or DFS with three colors, and write down its invariant first.`,
    kind: 'fn',
    compare: 'topo',
    fn: { name: 'topoSort', params: [['n', 'int'], ['edges', 'int[][]']], returns: 'int[]' },
    tests: [
      { args: [4, [[0, 1], [1, 2], [2, 3]]], expected: [0, 1, 2, 3] },
      { args: [4, [[0, 1], [0, 2], [1, 3], [2, 3]]], expected: [0, 1, 2, 3] },
      { args: [3, []], expected: [0, 1, 2] },
      { args: [5, [[3, 1], [4, 0]]], expected: [2, 3, 4, 1, 0] },
      { args: [3, [[0, 1], [1, 2], [2, 0]]], expected: [] },
      { args: [2, [[1, 1]]], expected: [] },
      { args: [4, [[0, 1], [2, 3], [3, 2]]], expected: [] },
    ],
  },

  '15-lru-cache': {
    brief: `Build an **LRU cache** with O(1) \`get\` and \`put\`: a hash map from key to node, plus a doubly linked list ordered by recency. Retype your own list; a built-in map is fine here.

- \`get\` returns **-1** for a missing key and marks a hit as most recently used.
- \`put\` inserts or updates (an update also counts as a use). When over capacity, evict the least recently used key.
- Capacity 0 stores nothing.`,
    kind: 'class',
    class: { name: 'LRUCache', ctor: [['capacity', 'int']], methods: [
      m('get', [['key', 'int']], 'int'), m('put', [['key', 'int'], ['value', 'int']], 'void'), m('remove', [['key', 'int']], 'bool'), m('size', [], 'int'),
    ] },
    tests: [
      t([2], [['put', [1, 1], null], ['put', [2, 2], null], ['get', [1], 1], ['put', [3, 3], null], ['get', [2], -1], ['put', [4, 4], null], ['get', [1], -1], ['get', [3], 3], ['get', [4], 4]]),
      t([2], [['put', [1, 1], null], ['put', [2, 2], null], ['put', [1, 10], null], ['put', [3, 3], null], ['get', [2], -1], ['get', [1], 10], ['size', [], 2]]),
      t([1], [['put', [1, 1], null], ['put', [2, 2], null], ['get', [1], -1], ['get', [2], 2], ['size', [], 1]]),
      t([0], [['put', [1, 1], null], ['get', [1], -1], ['size', [], 0]]),
      t([2], [['put', [1, 1], null], ['put', [2, 2], null], ['remove', [1], true], ['remove', [1], false], ['size', [], 1], ['put', [3, 3], null], ['get', [2], 2], ['get', [3], 3], ['size', [], 2]]),
      t([3], [...[1, 2, 3, 4, 5].map(k => ['put', [k, k], null]), ['get', [1], -1], ['get', [2], -1], ['get', [3], 3], ['put', [6, 6], null], ['get', [4], -1], ['get', [5], 5], ['get', [6], 6], ['size', [], 3]]),
    ],
  },

  '18-rate-limiter': {
    brief: `Build a **token-bucket rate limiter**. The bucket holds up to \`capacity\` tokens, starts **full** at time 0, and refills continuously at \`refillPerSecond\`.

- The clock is injected: every call passes \`nowMs\` (milliseconds since the limiter was created; it never goes backwards). No sleeping, no real time — that’s what makes it testable.
- \`allow(nowMs)\` refills for the elapsed time, then spends one token if at least one is available.
- \`available(nowMs)\` refills, then returns the whole tokens available.
- Use **integer arithmetic**: store milli-tokens (\`tokens × 1000\`); elapsed \`ms × refillPerSecond\` milli-tokens are added per refill. Floating-point refills drift, and the tests are exact.
- Capacity 0 never allows anything.`,
    kind: 'class',
    class: { name: 'RateLimiter', ctor: [['capacity', 'int'], ['refillPerSecond', 'int']], methods: [
      m('allow', [['nowMs', 'int']], 'bool'), m('available', [['nowMs', 'int']], 'int'),
    ] },
    tests: [
      t([3, 1], [['allow', [0], true], ['allow', [0], true], ['allow', [0], true], ['allow', [0], false], ['available', [0], 0], ['allow', [999], false], ['allow', [1000], true], ['available', [5000], 3]]),
      t([2, 4], [['allow', [0], true], ['allow', [0], true], ['allow', [0], false], ['allow', [250], true], ['allow', [250], false], ['allow', [1000], true], ['available', [1000], 1]]),
      t([0, 5], [['allow', [0], false], ['available', [100], 0], ['allow', [10000], false]]),
      t([5, 1000], [...range(0, 5).map(() => ['allow', [0], true]), ['allow', [0], false], ['allow', [1], true], ['allow', [1], false], ['available', [10], 5]]),
    ],
  },

  '20-pubsub': {
    brief: `Build an in-memory **pub/sub broker**. Subscribers are named; each has an inbox that holds at most \`inboxCapacity\` messages.

- \`subscribe(subscriber, topic)\` / \`unsubscribe(subscriber, topic)\` return false if nothing changed.
- \`publish(topic, message)\` delivers to every current subscriber of the topic and returns how many received it.
- **Slow-subscriber policy:** when an inbox is full, drop its **oldest** message to make room. Publishing never blocks.
- \`poll(subscriber)\` drains and returns the inbox in delivery order. Messages already delivered stay in the inbox after unsubscribing.

(The Go version is about channels and goroutines; this one is about getting the policy and bookkeeping right.)`,
    kind: 'class',
    class: { name: 'PubSub', ctor: [['inboxCapacity', 'int']], methods: [
      m('subscribe', [['subscriber', 'string'], ['topic', 'string']], 'bool'), m('unsubscribe', [['subscriber', 'string'], ['topic', 'string']], 'bool'),
      m('publish', [['topic', 'string'], ['message', 'string']], 'int'), m('poll', [['subscriber', 'string']], 'string[]'),
    ] },
    tests: [
      t([10], [['subscribe', ['a', 'news'], true], ['subscribe', ['b', 'news'], true], ['subscribe', ['a', 'news'], false], ['publish', ['news', 'hello'], 2], ['publish', ['sports', 'goal'], 0], ['poll', ['a'], ['hello']], ['poll', ['a'], []], ['poll', ['b'], ['hello']]]),
      t([10], [['subscribe', ['a', 'x'], true], ['subscribe', ['a', 'y'], true], ['publish', ['x', '1'], 1], ['publish', ['y', '2'], 1], ['publish', ['x', '3'], 1], ['poll', ['a'], ['1', '2', '3']]]),
      t([10], [['subscribe', ['a', 'x'], true], ['publish', ['x', 'm1'], 1], ['unsubscribe', ['a', 'x'], true], ['unsubscribe', ['a', 'x'], false], ['publish', ['x', 'm2'], 0], ['poll', ['a'], ['m1']]]),
      t([2], [['subscribe', ['s', 't'], true], ['publish', ['t', '1'], 1], ['publish', ['t', '2'], 1], ['publish', ['t', '3'], 1], ['poll', ['s'], ['2', '3']]]),
      t([3], [['poll', ['ghost'], []], ['unsubscribe', ['ghost', 't'], false]]),
    ],
  },

  '21-lexer': {
    brief: `Write a **lexer** as a state machine. Return tokens as strings:

| Input | Token |
|---|---|
| identifier \`[A-Za-z_][A-Za-z0-9_]*\` | \`IDENT:name\` |
| number: digits, optionally \`.\` + at least one digit | \`NUMBER:3.14\` |
| \`"…"\` string; escapes \`\\"\` \`\\\\\` \`\\n\` \`\\t\` | \`STRING:<decoded text>\` |
| \`( ) ,\` | \`LPAREN\` \`RPAREN\` \`COMMA\` |
| \`+ - * / = == != < <= > >=\` | \`OP:<=\` etc. (longest match) |
| end of input | \`EOF\` |

Spaces, tabs and newlines separate tokens. On an error — an invalid character, an unterminated string (report the opening quote), or an unknown escape (report the backslash) — append \`ERROR:<index>\` and **stop** (no \`EOF\`). \`<index>\` is the 0-based character position.`,
    kind: 'fn',
    fn: { name: 'tokenize', params: [['input', 'string']], returns: 'string[]' },
    tests: [
      { args: ['SET name "Mohamed"'], expected: ['IDENT:SET', 'IDENT:name', 'STRING:Mohamed', 'EOF'] },
      { args: [''], expected: ['EOF'] },
      { args: ['  \t\n '], expected: ['EOF'] },
      { args: ['f(x,1)'], expected: ['IDENT:f', 'LPAREN', 'IDENT:x', 'COMMA', 'NUMBER:1', 'RPAREN', 'EOF'] },
      { args: ['a>=b!=c==d<e'], expected: ['IDENT:a', 'OP:>=', 'IDENT:b', 'OP:!=', 'IDENT:c', 'OP:==', 'IDENT:d', 'OP:<', 'IDENT:e', 'EOF'] },
      { args: ['x = 3.14 * _y2'], expected: ['IDENT:x', 'OP:=', 'NUMBER:3.14', 'OP:*', 'IDENT:_y2', 'EOF'] },
      { args: ['"a \\"q\\" \\\\ b\\tc"'], expected: ['STRING:a "q" \\ b\tc', 'EOF'] },
      { args: ['"unterminated'], expected: ['ERROR:0'] },
      { args: ['ok @'], expected: ['IDENT:ok', 'ERROR:3'] },
      { args: ['12abc'], expected: ['NUMBER:12', 'IDENT:abc', 'EOF'] },
      { args: ['""'], expected: ['STRING:', 'EOF'] },
      { args: ['1 !'], expected: ['NUMBER:1', 'ERROR:2'] },
      { args: ['"a\\qb"'], expected: ['ERROR:2'] },
      { args: ['7.'], expected: ['NUMBER:7', 'ERROR:1'] },
    ],
  },

  '22-expression-parser': {
    brief: `Write a **recursive-descent parser** that evaluates integer arithmetic. Grammar:

\`\`\`text
expr   = term (("+" | "-") term)*
term   = factor (("*" | "/") factor)*
factor = NUMBER | "(" expr ")" | "-" factor
\`\`\`

- Return the result as a decimal string, or \`"error"\` for any syntax error (missing operand or parenthesis, unexpected or trailing token, empty input) and for **division by zero**.
- \`/\` is integer division **truncating toward zero** (\`-7 / 2\` is \`-3\`) — note that’s not what Python’s \`//\` does.
- Whitespace is allowed between tokens. Results fit in 32 bits.`,
    kind: 'fn',
    fn: { name: 'evaluate', params: [['expr', 'string']], returns: 'string' },
    tests: [
      { args: ['1 + 2 * 3'], expected: '7' },
      { args: ['(1 + 2) * 3'], expected: '9' },
      { args: ['10 - 4 - 3'], expected: '3' },
      { args: ['100 / 10 / 5'], expected: '2' },
      { args: ['-3 * -(2 + 1)'], expected: '9' },
      { args: ['7 / 2'], expected: '3' },
      { args: ['-7 / 2'], expected: '-3' },
      { args: ['2*(3+4)*5-6/3'], expected: '68' },
      { args: ['((42))'], expected: '42' },
      { args: ['1 / 0'], expected: 'error' },
      { args: ['8 / (3 - 3)'], expected: 'error' },
      { args: ['(1 + 2'], expected: 'error' },
      { args: ['1 +'], expected: 'error' },
      { args: ['1 2'], expected: 'error' },
      { args: [''], expected: 'error' },
      { args: [')'], expected: 'error' },
    ],
  },

  '23-json-parser': {
    brief: `Write a **JSON parser** and prove it by re-serializing: \`normalize(text)\` returns the **minified** JSON, or \`"invalid"\`. No built-in JSON library.

- Full grammar: objects, arrays, strings, numbers, \`true\`/\`false\`/\`null\`, whitespace (space, tab, \`\\n\`, \`\\r\`). Anything after the top-level value is invalid.
- Numbers follow the JSON grammar (\`-?(0|[1-9]\\d*)(\\.\\d+)?([eE][+-]?\\d+)?\`) and are emitted **exactly as written**.
- Strings: decode every escape (\`\\" \\\\ \\/ \\b \\f \\n \\r \\t \\uXXXX\`, including surrogate pairs); a raw control character is invalid. Re-encode with only \`\\"\` and \`\\\\\`, the named escapes \`\\b \\f \\n \\r \\t\`, and \`\\u00xx\` (lowercase hex) for other control characters. Everything else, including non-ASCII, is written raw.
- Object members keep their input order.`,
    kind: 'fn',
    fn: { name: 'normalize', params: [['text', 'string']], returns: 'string' },
    tests: [
      { args: ['{ "a" : 1, "b": [true, false, null] }'], expected: '{"a":1,"b":[true,false,null]}' },
      { args: [' [ ] '], expected: '[]' },
      { args: ['{}'], expected: '{}' },
      { args: ['"hi\\u0041\\n"'], expected: '"hiA\\n"' },
      { args: ['-0.5e+10'], expected: '-0.5e+10' },
      { args: ['{"a":{"b":{"c":[1,[2,[3]]]}}}'], expected: '{"a":{"b":{"c":[1,[2,[3]]]}}}' },
      { args: ['"\\/"'], expected: '"/"' },
      { args: ['"\\ud83d\\ude00 caf\\u00e9"'], expected: '"😀 café"' },
      { args: ['"\\u0001"'], expected: '"\\u0001"' },
      { args: ['\n\t"x"\r\n'], expected: '"x"' },
      ...['{"a" 1}', '[1,]', '[1 2]', 'tru', '01', '1.', '"abc', '{"a":1} x', '', '{a:1}', '"\\x"', '"a\tb"', '-', '[', '{"a":1,}'].map(bad => ({ args: [bad], expected: 'invalid' })),
    ],
  },

  '24-serialization': {
    brief: `Design a tiny **binary message format** and its codec. A frame is:

\`\`\`text
[kind: 1 byte][length: 4 bytes, big-endian unsigned][payload: length bytes of UTF-8]
\`\`\`

- Valid kinds are **1, 2, 3**. Maximum payload is **65,535** bytes.
- \`encode(type, payload)\` returns the frame as a byte array (values 0–255), or \`[]\` for an invalid type or oversized payload.
- \`decode(bytes)\` returns \`"<type>:<payload>"\`, or the **first** error in this order: \`error:truncated\` (fewer than 5 header bytes), \`error:type\`, \`error:too-large\` (declared length over the maximum), \`error:truncated\` (payload shorter than declared), \`error:trailing\` (extra bytes after the payload).`,
    kind: 'class',
    class: { name: 'Codec', ctor: [], methods: [
      m('encode', [['kind', 'int'], ['payload', 'string']], 'int[]'), m('decode', [['bytes', 'int[]']], 'string'),
    ] },
    tests: [
      t([], [['encode', [1, 'hi'], [1, 0, 0, 0, 2, 104, 105]], ['encode', [3, ''], [3, 0, 0, 0, 0]], ['encode', [9, 'x'], []], ['encode', [2, 'é'], [2, 0, 0, 0, 2, 195, 169]]]),
      t([], [['decode', [[1, 0, 0, 0, 2, 104, 105]], '1:hi'], ['decode', [[2, 0, 0, 0, 0]], '2:'], ['decode', [[2, 0, 0, 0, 2, 195, 169]], '2:é']]),
      t([], [['decode', [[]], 'error:truncated'], ['decode', [[1, 0, 0]], 'error:truncated'], ['decode', [[1, 0, 0, 0, 5, 104]], 'error:truncated'], ['decode', [[7, 0, 0, 0, 0]], 'error:type'], ['decode', [[1, 0, 0, 0, 1, 65, 66]], 'error:trailing'], ['decode', [[1, 0, 1, 0, 0]], 'error:too-large'], ['decode', [[0, 0, 0, 0, 9]], 'error:type']]),
      t([], [['encode', [1, 'hello world'], [1, 0, 0, 0, 11, 104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]], ['decode', [[1, 0, 0, 0, 11, 104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]], '1:hello world']]),
      t([], [['encode', [1, 'x'.repeat(65536)], []], ['encode', [1, 'y'.repeat(300)], [1, 0, 0, 1, 44, ...Array(300).fill(121)]]]),
    ],
  },

  '25-command-parser': {
    brief: `Parse a Redis-style command line into \`[NAME, ...args]\`, or \`["ERR", code]\`.

- Split on whitespace. An argument may be **double-quoted** to contain spaces, with \`\\"\` and \`\\\\\` escapes. A quote only opens at the start of an argument, and the closing quote must be followed by whitespace or the end of the line.
- The command name is case-insensitive and returned **uppercase**; arguments keep their case.
- Errors, checked in this order: \`empty\` (blank line), \`quote\` (unterminated or misplaced quote), \`unknown\` (not one of the commands below), \`arity\`, \`integer\` (EXPIRE seconds must be an integer, optionally negative).

| Command | Arguments |
|---|---|
| SET | key value |
| GET, TTL | key |
| DEL, EXISTS | key [key …] |
| EXPIRE | key seconds |`,
    kind: 'fn',
    fn: { name: 'parse', params: [['line', 'string']], returns: 'string[]' },
    tests: [
      { args: ['SET name Mohamed'], expected: ['SET', 'name', 'Mohamed'] },
      { args: ['set name "Mohamed Hefni"'], expected: ['SET', 'name', 'Mohamed Hefni'] },
      { args: ['  GET   name  '], expected: ['GET', 'name'] },
      { args: [''], expected: ['ERR', 'empty'] },
      { args: ['   '], expected: ['ERR', 'empty'] },
      { args: ['FLY away'], expected: ['ERR', 'unknown'] },
      { args: ['GET'], expected: ['ERR', 'arity'] },
      { args: ['GET a b'], expected: ['ERR', 'arity'] },
      { args: ['DEL a b c'], expected: ['DEL', 'a', 'b', 'c'] },
      { args: ['exists a'], expected: ['EXISTS', 'a'] },
      { args: ['EXPIRE name 60'], expected: ['EXPIRE', 'name', '60'] },
      { args: ['EXPIRE name -5'], expected: ['EXPIRE', 'name', '-5'] },
      { args: ['EXPIRE name soon'], expected: ['ERR', 'integer'] },
      { args: ['EXPIRE name 6x'], expected: ['ERR', 'integer'] },
      { args: ['SET k "unterminated'], expected: ['ERR', 'quote'] },
      { args: ['SET k "a \\"b\\" \\\\"'], expected: ['SET', 'k', 'a "b" \\'] },
      { args: ['SET k ""'], expected: ['SET', 'k', ''] },
      { args: ['SET k "a"b'], expected: ['ERR', 'quote'] },
      { args: ['SET k'], expected: ['ERR', 'arity'] },
    ],
  },

  '26-kv-engine': {
    brief: `Build the storage engine for a mini Redis — no parsing, no networking.

- \`get\` returns \`"(nil)"\` for a missing key. Empty keys and empty values are allowed.
- \`delete\` and \`exists\` return booleans; \`size\` is the number of keys.
- \`keys(pattern)\` returns matching keys **sorted**. Patterns are globs: \`*\` matches any run of characters (including none), \`?\` exactly one; everything else is literal. Write the matcher yourself.`,
    kind: 'class',
    class: { name: 'Engine', ctor: [], methods: [
      m('set', [['key', 'string'], ['value', 'string']], 'void'), m('get', [['key', 'string']], 'string'),
      m('remove', [['key', 'string']], 'bool'), m('exists', [['key', 'string']], 'bool'),
      m('keys', [['pattern', 'string']], 'string[]'), m('size', [], 'int'),
    ] },
    tests: [
      t([], [['get', ['a'], '(nil)'], ['exists', ['a'], false], ['set', ['a', '1'], null], ['get', ['a'], '1'], ['exists', ['a'], true], ['size', [], 1]]),
      t([], [['set', ['a', '1'], null], ['set', ['a', '2'], null], ['get', ['a'], '2'], ['size', [], 1], ['remove', ['a'], true], ['remove', ['a'], false], ['get', ['a'], '(nil)'], ['size', [], 0]]),
      t([], [['set', ['', 'empty'], null], ['get', [''], 'empty'], ['set', ['k', ''], null], ['get', ['k'], ''], ['exists', ['k'], true]]),
      t([], [['set', ['user:1', 'a'], null], ['set', ['user:2', 'b'], null], ['set', ['user:10', 'c'], null], ['set', ['order:1', 'd'], null], ['keys', ['user:*'], ['user:1', 'user:10', 'user:2']], ['keys', ['user:?'], ['user:1', 'user:2']], ['keys', ['*'], ['order:1', 'user:1', 'user:10', 'user:2']], ['keys', ['nope*'], []], ['keys', ['order:1'], ['order:1']]]),
      t([], [['set', ['abc', '1'], null], ['set', ['axc', '2'], null], ['set', ['ac', '3'], null], ['set', ['abcd', '4'], null], ['keys', ['a*c'], ['abc', 'ac', 'axc']], ['keys', ['a?c'], ['abc', 'axc']], ['keys', ['*c*'], ['abc', 'abcd', 'ac', 'axc']], ['keys', ['a**'], ['abc', 'abcd', 'ac', 'axc']]]),
    ],
  },

  '27-ttl-engine': {
    brief: `Add **expiration** to a key/value store with **lazy expiry**: nothing runs in the background; every call checks whether the key it touches has expired. The clock is injected as \`nowMs\` (never decreasing).

- A key with expiry time \`at\` is gone once \`nowMs >= at\`.
- \`set\` stores the value and **clears** any expiry (like Redis). \`get\` returns \`"(nil)"\` if missing or expired.
- \`expire(key, seconds, nowMs)\` returns false for a missing key. \`seconds <= 0\` deletes the key immediately (and returns true).
- \`ttl\` returns **-2** for a missing key, **-1** for a key without expiry, otherwise the remaining time in seconds **rounded up**.
- \`persist\` removes the expiry and returns whether there was one. \`delete\` returns whether the key existed.`,
    kind: 'class',
    class: { name: 'TTLEngine', ctor: [], methods: [
      m('set', [['key', 'string'], ['value', 'string'], ['nowMs', 'int']], 'void'), m('get', [['key', 'string'], ['nowMs', 'int']], 'string'),
      m('expire', [['key', 'string'], ['seconds', 'int'], ['nowMs', 'int']], 'bool'), m('ttl', [['key', 'string'], ['nowMs', 'int']], 'int'),
      m('persist', [['key', 'string'], ['nowMs', 'int']], 'bool'), m('remove', [['key', 'string'], ['nowMs', 'int']], 'bool'),
    ] },
    tests: [
      t([], [['set', ['a', '1', 0], null], ['ttl', ['a', 0], -1], ['expire', ['a', 10, 0], true], ['ttl', ['a', 0], 10], ['ttl', ['a', 1], 10], ['ttl', ['a', 1000], 9], ['ttl', ['a', 9001], 1], ['get', ['a', 9999], '1'], ['get', ['a', 10000], '(nil)'], ['ttl', ['a', 10000], -2], ['expire', ['a', 5, 10000], false]]),
      t([], [['ttl', ['x', 0], -2], ['expire', ['x', 5, 0], false], ['persist', ['x', 0], false], ['get', ['x', 0], '(nil)']]),
      t([], [['set', ['a', '1', 0], null], ['expire', ['a', 5, 0], true], ['set', ['a', '2', 1000], null], ['ttl', ['a', 1000], -1], ['get', ['a', 999999], '2']]),
      t([], [['set', ['a', '1', 0], null], ['expire', ['a', 5, 0], true], ['expire', ['a', 20, 4000], true], ['get', ['a', 10000], '1'], ['ttl', ['a', 10000], 14], ['persist', ['a', 10000], true], ['persist', ['a', 10000], false], ['ttl', ['a', 10000], -1]]),
      t([], [['set', ['a', '1', 0], null], ['expire', ['a', 0, 0], true], ['get', ['a', 0], '(nil)'], ['expire', ['a', -1, 0], false], ['remove', ['a', 0], false]]),
      t([], [['set', ['a', '1', 0], null], ['expire', ['a', 5, 0], true], ['remove', ['a', 1000], true], ['ttl', ['a', 1000], -2], ['set', ['a', 'x', 2000], null], ['ttl', ['a', 2000], -1]]),
    ],
  },

  '28-wal': {
    brief: `Build the heart of a **write-ahead log**: record framing and crash recovery. (Files and \`fsync\` are the Go-only part; here the “disk” is a byte array.)

Each record is framed as:

\`\`\`text
[length: 4 bytes big-endian][payload: UTF-8 bytes][checksum: 1 byte = sum of payload bytes mod 256]
\`\`\`

- \`encode(records)\` returns the log bytes for the records, in order.
- \`recover(bytes)\` reads records from the start and **stops at the first torn or corrupt record** (truncated header, truncated payload, missing checksum, or checksum mismatch) — a crash mid-append must never lose earlier records or invent new ones.
- \`replay(bytes)\` recovers, then applies \`SET <key> <value…>\` (the value is the rest of the line, spaces included) and \`DEL <key>\` in order, ignoring anything else, and returns the final state as \`key=value\` strings **sorted by key**.`,
    kind: 'class',
    class: { name: 'Wal', ctor: [], methods: [
      m('encode', [['records', 'string[]']], 'int[]'), m('recover', [['bytes', 'int[]']], 'string[]'), m('replay', [['bytes', 'int[]']], 'string[]'),
    ] },
    tests: [
      t([], [['encode', [['SET a 1']], frame('SET a 1')], ['encode', [[]], []], ['encode', [['', 'x']], [...frame(''), ...frame('x')]]]),
      t([], [['recover', [frame('SET a 1')], ['SET a 1']], ['recover', [[0, 0, 0, 7, 83, 69, 84]], []], ['recover', [[0, 0]], []], ['recover', [[]], []]]),
      t([], [['recover', [[...frame('SET a 1'), ...frame('DEL a').slice(0, -1)]], ['SET a 1']], ['recover', [[...frame('SET a 1'), ...frame('DEL a').map((b, i, a) => (i === a.length - 1 ? (b + 1) % 256 : b))]], ['SET a 1']], ['recover', [[...frame('SET a 1'), ...frame('DEL a')]], ['SET a 1', 'DEL a']]]),
      t([], [['replay', [['SET a 1', 'SET b hello world', 'DEL a', 'SET c 3', 'SET b 2'].flatMap(frame)], ['b=2', 'c=3']], ['replay', [['SET k v', 'NOPE x', 'DEL missing', 'SET msg a b  c'].flatMap(frame)], ['k=v', 'msg=a b  c']], ['replay', [[...frame('SET a 1'), ...frame('SET a 2').slice(0, 6)]], ['a=1']]]),
    ],
  },

  '30-mini-redis': {
    brief: `Wire the pieces into a **mini Redis**: \`exec(line, nowMs)\` parses a command (Day 25 rules), runs it against a store with lazy TTLs (Days 26–27), and returns a redis-cli style reply.

| Command | Reply |
|---|---|
| \`SET key value\` | \`OK\` (clears any TTL) |
| \`GET key\` | the value, or \`(nil)\` |
| \`DEL key…\` / \`EXISTS key…\` | \`(integer) n\` — keys deleted / keys that exist |
| \`EXPIRE key seconds\` | \`(integer) 1\`, or \`(integer) 0\` if the key is missing; seconds ≤ 0 deletes |
| \`TTL key\` | \`(integer) n\` — -2 missing, -1 no expiry, else seconds rounded up |

Errors: \`(error) ERR empty command\`, \`(error) ERR unbalanced quotes\`, \`(error) ERR unknown command\`, \`(error) ERR wrong number of arguments\`, \`(error) ERR value is not an integer\`. Keys are case-sensitive; command names aren’t.`,
    kind: 'class',
    class: { name: 'MiniRedis', ctor: [], methods: [m('exec', [['line', 'string'], ['nowMs', 'int']], 'string')] },
    tests: [
      t([], [['exec', ['SET name Mohamed', 0], 'OK'], ['exec', ['GET name', 0], 'Mohamed'], ['exec', ['get NAME', 0], '(nil)'], ['exec', ['EXISTS name nope', 0], '(integer) 1'], ['exec', ['DEL name nope', 0], '(integer) 1'], ['exec', ['GET name', 0], '(nil)']]),
      t([], [['exec', ['SET greeting "hello world"', 0], 'OK'], ['exec', ['GET greeting', 0], 'hello world'], ['exec', ['EXPIRE greeting 10', 0], '(integer) 1'], ['exec', ['TTL greeting', 5000], '(integer) 5'], ['exec', ['GET greeting', 10000], '(nil)'], ['exec', ['TTL greeting', 10000], '(integer) -2'], ['exec', ['EXPIRE greeting 10', 10000], '(integer) 0']]),
      t([], [['exec', ['', 0], '(error) ERR empty command'], ['exec', ['FLY', 0], '(error) ERR unknown command'], ['exec', ['GET', 0], '(error) ERR wrong number of arguments'], ['exec', ['EXPIRE a soon', 0], '(error) ERR value is not an integer'], ['exec', ['SET a "oops', 0], '(error) ERR unbalanced quotes']]),
      t([], [['exec', ['SET a 1', 0], 'OK'], ['exec', ['EXPIRE a 5', 0], '(integer) 1'], ['exec', ['SET a 2', 1000], 'OK'], ['exec', ['TTL a', 1000], '(integer) -1'], ['exec', ['TTL missing', 1000], '(integer) -2']]),
      t([], [['exec', ['SET a 1', 0], 'OK'], ['exec', ['SET b 2', 0], 'OK'], ['exec', ['SET c 3', 0], 'OK'], ['exec', ['DEL a b c d', 0], '(integer) 3'], ['exec', ['EXISTS a', 0], '(integer) 0'], ['exec', ['EXPIRE b 0', 0], '(integer) 0']]),
      t([], [['exec', ['SET a 1', 0], 'OK'], ['exec', ['EXPIRE a -1', 0], '(integer) 1'], ['exec', ['EXISTS a', 0], '(integer) 0']]),
    ],
  },
};
