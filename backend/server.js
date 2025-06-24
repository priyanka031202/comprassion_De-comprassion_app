const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
import { compressRLE, decompressRLE } from "./rle.js";
import { compressHuffman, decompressHuffman } from "./huffman.js";

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

const PORT = process.env.PORT || 5000;

app.post("/compress", upload.single("file"), async (req, res) => {
  try {
    const algorithm = req.body.algorithm;
    const inputBuffer = fs.readFileSync(req.file.path);

    let outputBuffer, outputFilename;
    if (algorithm === "rle") {
      outputBuffer = compressRLE(inputBuffer);
      outputFilename = req.file.originalname + ".rle";
    } else if (algorithm === "huffman") {
      outputBuffer = compressHuffman(inputBuffer);
      outputFilename = req.file.originalname + ".huff";
    } else {
      return res.status(400).json({ error: "Unsupported algorithm" });
    }

    const outputPath = path.join("outputs", outputFilename);
    fs.writeFileSync(outputPath, outputBuffer);
    const stats = {
      originalSize: inputBuffer.length,
      compressedSize: outputBuffer.length,
      ratio: (100 * outputBuffer.length) / inputBuffer.length,
      time: Math.random() * 100, // Placeholder
    };

    res.json({
      message: "Compression successful",
      fileUrl: `${req.protocol}://${req.get("host")}/download/${outputFilename}`,
      stats,
    });
  } catch (err) {
    console.error("Compression error:", err);
    res.status(500).json({ error: "Compression failed" });
  }
});

app.post("/decompress", upload.single("file"), async (req, res) => {
  try {
    const algorithm = req.body.algorithm;
    const inputBuffer = fs.readFileSync(req.file.path);

    let outputBuffer, outputFilename;
    if (algorithm === "rle") {
      outputBuffer = decompressRLE(inputBuffer);
      outputFilename = req.file.originalname.replace(/\.rle$/, "") + ".txt";
    } else if (algorithm === "huffman") {
      outputBuffer = Buffer.from(decompressHuffman(inputBuffer), "utf-8");
      outputFilename = req.file.originalname.replace(/\.huff$/, "") + ".txt";
    } else {
      return res.status(400).json({ error: "Unsupported algorithm" });
    }

    const outputPath = path.join("outputs", outputFilename);
    fs.writeFileSync(outputPath, outputBuffer);
    const stats = {
      decompressedSize: outputBuffer.length,
      time: Math.random() * 100, // Placeholder
    };

    res.json({
      message: "Decompression successful",
      fileUrl: `${req.protocol}://${req.get("host")}/download/${outputFilename}`,
      stats,
    });
  } catch (err) {
    console.error("Decompression error:", err);
    res.status(500).json({ error: "Decompression failed" });
  }
});

app.use("/download", express.static(path.join(__dirname, "outputs")));

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
