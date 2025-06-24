// backend/huffman.js

// Simple frequency map generator
function buildFrequencyMap(data) {
  const map = new Map();
  for (let char of data) {
    map.set(char, (map.get(char) || 0) + 1);
  }
  return map;
}

// Build the Huffman Tree
function buildHuffmanTree(freqMap) {
  const heap = [...freqMap.entries()].map(([char, freq]) => ({ char, freq, left: null, right: null }));

  while (heap.length > 1) {
    heap.sort((a, b) => a.freq - b.freq);
    const left = heap.shift();
    const right = heap.shift();
    heap.push({
      char: null,
      freq: left.freq + right.freq,
      left,
      right
    });
  }

  return heap[0];
}

// Build binary codes from Huffman Tree
function buildCodes(tree, path = "", map = {}) {
  if (!tree) return;
  if (tree.char !== null) {
    map[tree.char] = path;
  }
  buildCodes(tree.left, path + "0", map);
  buildCodes(tree.right, path + "1", map);
  return map;
}

export function huffmanCompress(data) {
  const freqMap = buildFrequencyMap(data);
  const tree = buildHuffmanTree(freqMap);
  const codeMap = buildCodes(tree);

  const encoded = [...data].map(char => codeMap[char]).join("");

  // Store the tree as a string to reconstruct it later (basic serialization)
  const serializedMap = JSON.stringify(Object.fromEntries(codeMap));
  return {
    compressedData: encoded,
    codeMap: serializedMap
  };
}

export function huffmanDecompress(encodedData, codeMapStr) {
  const codeMap = JSON.parse(codeMapStr);
  const reverseMap = Object.fromEntries(Object.entries(codeMap).map(([k, v]) => [v, k]));

  let current = "";
  let decoded = "";

  for (let bit of encodedData) {
    current += bit;
    if (reverseMap[current]) {
      decoded += reverseMap[current];
      current = "";
    }
  }

  return decoded;
}
