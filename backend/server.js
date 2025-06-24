// server.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { compressRLE, decompressRLE } from "./rle.js";
import { compressHuffman, decompressHuffman } from "./huffman.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

const upload = multer({ dest: "uploads/" });
const outputDir = path.join(__dirname, "outputs");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}
app.use("/outputs", express.static(outputDir));
app.use(express.json());

function getStats(originalBuffer, outputBuffer, startTime) {
  return {
    originalSize: originalBuffer.length,
    compressedSize: outputBuffer.length,
    ratio: (outputBuffer.length / originalBuffer.length) * 100,
    time: Date.now() - startTime,
  };
}

app.post("/compress", upload.single("file"), (req, res) => {
  try {
    const algorithm = req.body.algorithm;
    const fileBuffer = fs.readFileSync(req.file.path);
    const startTime = Date.now();

    let outputBuffer;
    let ext;
    if (algorithm === "rle") {
      outputBuffer = compressRLE(fileBuffer);
      ext = ".rle";
    } else if (algorithm === "huffman") {
      outputBuffer = compressHuffman(fileBuffer);
      ext = ".huff";
    } else {
      return res.status(400).json({ error: "Invalid algorithm" });
    }

    const outputFilename = req.file.originalname + ext;
    const outputPath = path.join(outputDir, outputFilename);
    fs.writeFileSync(outputPath, outputBuffer);

    res.json({
      message: "File compressed successfully",
      stats: getStats(fileBuffer, outputBuffer, startTime),
      fileUrl: `${req.protocol}://${req.get("host")}/outputs/${outputFilename}`,
    });
  } catch (err) {
    console.error("Compression error:", err);
    res.status(500).json({ error: "Compression failed" });
  }
});

app.post("/decompress", upload.single("file"), (req, res) => {
  try {
    const algorithm = req.body.algorithm;
    const fileBuffer = fs.readFileSync(req.file.path);
    const startTime = Date.now();

    let outputBuffer;
    if (algorithm === "rle") {
      outputBuffer = decompressRLE(fileBuffer);
    } else if (algorithm === "huffman") {
      outputBuffer = decompressHuffman(fileBuffer);
    } else {
      return res.status(400).json({ error: "Invalid algorithm" });
    }

    const outputFilename = req.file.originalname.replace(/\.(rle|huff)$/i, "") + ".decoded.txt";
    const outputPath = path.join(outputDir, outputFilename);
    fs.writeFileSync(outputPath, outputBuffer);

    res.json({
      message: "File decompressed successfully",
      stats: {
        decompressedSize: outputBuffer.length,
        time: Date.now() - startTime,
      },
      fileUrl: `${req.protocol}://${req.get("host")}/outputs/${outputFilename}`,
    });
  } catch (err) {
    console.error("Decompression error:", err);
    res.status(500).json({ error: "Decompression failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
