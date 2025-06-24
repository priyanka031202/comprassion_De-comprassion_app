// ✅ server.js (Backend)
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Create uploads folder if not exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

function runLengthCompress(inputPath, outputPath) {
  const input = fs.readFileSync(inputPath, "utf8");
  let compressed = "";
  let count = 1;
  for (let i = 0; i < input.length; i++) {
    while (i + 1 < input.length && input[i] === input[i + 1]) {
      count++;
      i++;
    }
    compressed += input[i] + count;
    count = 1;
  }
  fs.writeFileSync(outputPath, compressed);
}

function runLengthDecompress(inputPath, outputPath) {
  const input = fs.readFileSync(inputPath, "utf8");
  let decompressed = "";
  for (let i = 0; i < input.length; i += 2) {
    const char = input[i];
    const count = parseInt(input[i + 1]);
    decompressed += char.repeat(count);
  }
  fs.writeFileSync(outputPath, decompressed);
}

app.post("/compress", upload.single("file"), (req, res) => {
  const inputPath = req.file.path;
  const outputFilename = `compressed-${req.file.originalname}`;
  const outputPath = path.join("uploads", outputFilename);
  const start = Date.now();

  runLengthCompress(inputPath, outputPath);

  const duration = Date.now() - start;
  const inputSize = fs.statSync(inputPath).size;
  const outputSize = fs.statSync(outputPath).size;
  const ratio = ((1 - outputSize / inputSize) * 100).toFixed(2);

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${outputFilename}`;

  res.json({
    message: "File compressed successfully!",
    fileUrl,
    stats: {
      originalSize: inputSize,
      compressedSize: outputSize,
      ratio,
      time: duration,
    },
  });
});

app.post("/decompress", upload.single("file"), (req, res) => {
  const inputPath = req.file.path;
  const outputFilename = `decompressed-${req.file.originalname}`;
  const outputPath = path.join("uploads", outputFilename);
  const start = Date.now();

  runLengthDecompress(inputPath, outputPath);

  const duration = Date.now() - start;
  const inputSize = fs.statSync(inputPath).size;
  const outputSize = fs.statSync(outputPath).size;

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${outputFilename}`;

  res.json({
    message: "File decompressed successfully!",
    fileUrl,
    stats: {
      decompressedSize: outputSize,
      time: duration,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
