import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { compressRLE, decompressRLE } from "./rle.js";
import { compressHuffman, decompressHuffman } from "./huffman.js";

const app = express();
const port = process.env.PORT || 5000;

// CORS middleware
app.use(cors());

// Setup Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// For __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure outputs folder exists
const outputDir = path.join(__dirname, "outputs");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Compression route
app.post("/compress", upload.single("file"), (req, res) => {
  try {
    const { algorithm } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let outputBuffer;
    if (algorithm === "rle") {
      outputBuffer = compressRLE(file.buffer);
    } else if (algorithm === "huffman") {
      outputBuffer = compressHuffman(file.buffer);
    } else {
      return res.status(400).json({ error: "Unsupported algorithm" });
    }

    const outputFilename = `${file.originalname}.${algorithm}`;
    const outputPath = path.join(outputDir, outputFilename);
    fs.writeFileSync(outputPath, outputBuffer);

    const stats = {
      originalSize: file.size,
      compressedSize: outputBuffer.length,
      ratio: (100 * outputBuffer.length) / file.size,
      time: 0,
    };

    res.json({
      message: "File compressed successfully",
      fileUrl: `/download/${outputFilename}`,
      stats,
    });
  } catch (error) {
    console.error("Compression error:", error);
    res.status(500).json({ error: "Compression failed" });
  }
});

// Decompression route
app.post("/decompress", upload.single("file"), (req, res) => {
  try {
    const { algorithm } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let outputBuffer;
    if (algorithm === "rle") {
      outputBuffer = decompressRLE(file.buffer);
    } else if (algorithm === "huffman") {
      outputBuffer = Buffer.from(decompressHuffman(file.buffer), "utf-8");
    } else {
      return res.status(400).json({ error: "Unsupported algorithm" });
    }

    const outputFilename = `${file.originalname}.decompressed.txt`;
    const outputPath = path.join(outputDir, outputFilename);
    fs.writeFileSync(outputPath, outputBuffer);

    const stats = {
      decompressedSize: outputBuffer.length,
      time: 0,
    };

    res.json({
      message: "File decompressed successfully",
      fileUrl: `/download/${outputFilename}`,
      stats,
    });
  } catch (error) {
    console.error("Decompression error:", error);
    res.status(500).json({ error: "Decompression failed" });
  }
});

// Serve files for download
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(outputDir, filename);

  if (fs.existsSync(filepath)) {
    res.download(filepath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
