// Huffman encoding utility functions

function buildFrequencyMap(data) {
  const freqMap = {};
  for (const char of data) {
    freqMap[char] = (freqMap[char] || 0) + 1;
  }
  return freqMap;
}

function buildHuffmanTree(freqMap) {
  const nodes = Object.entries(freqMap).map(([char, freq]) => ({
    char,
    freq,
    left: null,
    right: null,
  }));

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    const newNode = {
      char: null,
      freq: left.freq + right.freq,
      left,
      right,
    };
    nodes.push(newNode);
  }

  return nodes[0];
}

function buildCodeMap(node, prefix = "", map = {}) {
  if (node.char !== null) {
    map[node.char] = prefix;
  } else {
    buildCodeMap(node.left, prefix + "0", map);
    buildCodeMap(node.right, prefix + "1", map);
  }
  return map;
}

function encodeData(data, codeMap) {
  return data.split("").map(char => codeMap[char]).join("");
}

function decodeData(encodedData, tree) {
  let result = "";
  let node = tree;
  for (const bit of encodedData) {
    node = bit === "0" ? node.left : node.right;
    if (node.char !== null) {
      result += node.char;
      node = tree;
    }
  }
  return result;
}

// Compression
function compressHuffman(buffer) {
  const data = buffer.toString("utf8");
  const freqMap = buildFrequencyMap(data);
  const tree = buildHuffmanTree(freqMap);
  const codeMap = buildCodeMap(tree);
  const encoded = encodeData(data, codeMap);

  const metadata = JSON.stringify(freqMap);
  const metadataLength = Buffer.byteLength(metadata);

  const finalBuffer = Buffer.concat([
    Buffer.from(metadataLength.toString().padStart(8, "0")), // 8-byte length prefix
    Buffer.from(metadata), // metadata
    Buffer.from(encoded, "binary"), // encoded content
  ]);

  return finalBuffer;
}

// Decompression
function decompressHuffman(buffer) {
  const metadataLength = parseInt(buffer.slice(0, 8).toString(), 10);
  const metadata = JSON.parse(buffer.slice(8, 8 + metadataLength).toString());
  const tree = buildHuffmanTree(metadata);
  const encodedData = buffer.slice(8 + metadataLength).toString();
  return decodeData(encodedData, tree);
}

export { compressHuffman, decompressHuffman };
