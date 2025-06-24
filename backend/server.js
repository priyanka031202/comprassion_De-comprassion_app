const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });


const allowedTypes = ["text/plain", "image/jpeg", "image/png", "application/pdf"];




function compressRLE(buffer) {
  const input = buffer.toString("binary");
  let compressed = "";
  for (let i = 0; i < input.length; i++) {
    let count = 1;
    while (input[i] === input[i + 1]) {
      count++;
      i++;
    }
    compressed += count + input[i];
  }
  return Buffer.from(compressed, "binary");
}

function decompressRLE(buffer) {
  const input = buffer.toString("binary");
  let decompressed = "";
  let i = 0;
  while (i < input.length) {
    let count = "";
    while (!isNaN(input[i])) {
      count += input[i];
      i++;
    }
    decompressed += input[i].repeat(parseInt(count));
    i++;
  }
  return Buffer.from(decompressed, "binary");
}





function buildFrequencyMap(data) {
  const freq = {};
  for (let ch of data) freq[ch] = (freq[ch] || 0) + 1;
  return freq;
}

function buildHuffmanTree(freq) {
  const heap = Object.entries(freq).map(([char, freq]) => ({ char, freq, left: null, right: null }));
  while (heap.length > 1) {
    heap.sort((a, b) => a.freq - b.freq);
    const left = heap.shift();
    const right = heap.shift();
    heap.push({ freq: left.freq + right.freq, left, right });
  }
  return heap[0];
}

function generateCodes(node, prefix = "", map = {}) {
  if (!node) return;
  if (node.char) map[node.char] = prefix;
  generateCodes(node.left, prefix + "0", map);
  generateCodes(node.right, prefix + "1", map);
  return map;
}

function compressHuffman(buffer) {
  const text = buffer.toString("utf-8");
  const freq = buildFrequencyMap(text);
  const tree = buildHuffmanTree(freq);
  const codes = generateCodes(tree);

  const binary = [...text].map(c => codes[c]).join("");
  const paddedBinary = binary.padEnd(Math.ceil(binary.length / 8) * 8, "0");
  const byteArray = new Uint8Array(paddedBinary.match(/.{8}/g).map(b => parseInt(b, 2)));

  return Buffer.concat([
    Buffer.from(JSON.stringify({ freq }), "utf-8"),
    Buffer.from("\n===\n"),
    Buffer.from(byteArray),
  ]);
}

function decompressHuffman(buffer) {
  const content = buffer.toString("binary");
  const split = content.indexOf("\n===\n");
  const metadata = content.slice(0, split);
  const compressedBinary = buffer.slice(Buffer.byteLength(metadata + "\n===\n"));

  const freq = JSON.parse(metadata);
  const tree = buildHuffmanTree(freq);

  let bitString = "";
  for (let byte of compressedBinary) {
    bitString += byte.toString(2).padStart(8, "0");
  }

  let result = "";
  let node = tree;
  for (let bit of bitString) {
    node = bit === "0" ? node.left : node.right;
    if (node.char) {
      result += node.char;
      node = tree;
    }
  }

  return Buffer.from(result, "utf-8");
}




app.post("/compress", upload.single("file"), (req, res) => {
  try {
    const file = req.file;
    const algorithm = req.body.algorithm;

    if (!file) return res.status(400).json({ error: " No file uploaded." });
    if (!allowedTypes.includes(file.mimetype)) return res.status(400).json({ error: "❌ Unsupported file type." });

    const inputPath = file.path;
    const outputPath = `uploads/compressed-${Date.now()}.bin`;
    const original = fs.readFileSync(inputPath);
    const start = Date.now();

    let compressed;
    if (algorithm === "rle") {
      compressed = compressRLE(original);
    } else if (algorithm === "huffman") {
      compressed = compressHuffman(original);
    } else {
      return res.status(400).json({ error: " Unsupported compression algorithm." });
    }

    fs.writeFileSync(outputPath, compressed);
    const time = Date.now() - start;

    res.json({
      message: ` File compressed using ${algorithm}`,
      stats: {
        originalSize: original.length,
        compressedSize: compressed.length,
        ratio: 100 - (compressed.length / original.length) * 100,
        time,
      },
      fileUrl: `http://localhost:5000/${outputPath.replace(/\\/g, "/")}`,
    });
  } catch (err) {
    console.error(" Compression error:", err);
    res.status(500).json({ error: " Compression failed." });
  }
});




app.post("/decompress", upload.single("file"), (req, res) => {
  try {
    const file = req.file;
    const algorithm = req.body.algorithm;

    if (!file) return res.status(400).json({ error: " No file uploaded." });

    const inputPath = file.path;
    const outputPath = `uploads/decompressed-${Date.now()}.bin`;
    const original = fs.readFileSync(inputPath);
    const start = Date.now();

    let decompressed;
    if (algorithm === "rle") {
      decompressed = decompressRLE(original);
    } else if (algorithm === "huffman") {
      decompressed = decompressHuffman(original);
    } else {
      return res.status(400).json({ error: " Unsupported decompression algorithm." });
    }

    fs.writeFileSync(outputPath, decompressed);
    const time = Date.now() - start;

    res.json({
      message: ` File decompressed using ${algorithm}`,
      stats: {
        compressedSize: original.length,
        decompressedSize: decompressed.length,
        time,
      },
      fileUrl: `http://localhost:5000/${outputPath.replace(/\\/g, "/")}`,
    });
  } catch (err) {
    console.error(" Decompression error:", err);
    res.status(500).json({ error: " Decompression failed." });
  }
});




app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
});
