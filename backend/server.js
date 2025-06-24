import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { compressRLE, decompressRLE } from "./rle.js";
import { compressHuffman, decompressHuffman } from "./huffman.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use("/files", express.static(path.join(__dirname, "files")));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/compress", upload.single("file"), async (req, res) => {
  const file = req.file;
  const algorithm = req.body.algorithm;

  if (!file) return res.status(400).json({ error: "No file uploaded." });

  const originalBuffer = file.buffer;
  const startTime = Date.now();
  let compressed, fileName;

  if (algorithm === "rle") {
    compressed = compressRLE(originalBuffer);
    fileName = `compressed_rle_${Date.now()}.bin`;
  } else if (algorithm === "huffman") {
    compressed = compressHuffman(originalBuffer);
    fileName = `compressed_huffman_${Date.now()}.bin`;
  } else {
    return res.status(400).json({ error: "Invalid algorithm." });
  }

  const filePath = path.join(__dirname, "files", fileName);
  fs.writeFileSync(filePath, compressed);

  const time = Date.now() - startTime;
  res.json({
    message: "File compressed successfully.",
    fileUrl: `/files/${fileName}`,
    stats: {
      originalSize: originalBuffer.length,
      compressedSize: compressed.length,
      ratio: (compressed.length / originalBuffer.length) * 100,
      time,
    },
  });
});

app.post("/decompress", upload.single("file"), async (req, res) => {
  const file = req.file;
  const algorithm = req.body.algorithm;

  if (!file) return res.status(400).json({ error: "No file uploaded." });

  const compressedBuffer = file.buffer;
  const startTime = Date.now();
  let decompressed, fileName;

  if (algorithm === "rle") {
    decompressed = decompressRLE(compressedBuffer);
    fileName = `decompressed_rle_${Date.now()}.bin`;
  } else if (algorithm === "huffman") {
    decompressed = decompressHuffman(compressedBuffer);
    fileName = `decompressed_huffman_${Date.now()}.bin`;
  } else {
    return res.status(400).json({ error: "Invalid algorithm." });
  }

  const filePath = path.join(__dirname, "files", fileName);
  fs.writeFileSync(filePath, decompressed);

  const time = Date.now() - startTime;
  res.json({
    message: "File decompressed successfully.",
    fileUrl: `/files/${fileName}`,
    stats: {
      decompressedSize: decompressed.length,
      time,
    },
  });
});

app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
});
