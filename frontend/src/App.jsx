import { useState } from "react";

const BACKEND_URL = "https://comprassion-de-comprassion-app-2.onrender.com";

export default function App() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("compress");
  const [algorithm, setAlgorithm] = useState("rle");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("algorithm", algorithm);

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch(`${BACKEND_URL}/${mode}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error");
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4 text-center">
          File {mode === "compress" ? "Compression" : "Decompression"} App
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />

          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                value="compress"
                checked={mode === "compress"}
                onChange={() => setMode("compress")}
              />{" "}
              Compress
            </label>
            <label>
              <input
                type="radio"
                value="decompress"
                checked={mode === "decompress"}
                onChange={() => setMode("decompress")}
              />{" "}
              Decompress
            </label>
          </div>

          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full border px-2 py-1"
          >
            <option value="rle">Run-Length Encoding (RLE)</option>
            <option value="huffman">Huffman Coding</option>
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 w-full rounded"
            disabled={loading}
          >
            {loading
              ? mode === "compress"
                ? "Compressing..."
                : "Decompressing..."
              : mode === "compress"
              ? "Compress File"
              : "Decompress File"}
          </button>
        </form>

        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        {result && (
          <div className="mt-6 text-sm text-gray-800">
            <p>{result.message}</p>
            <ul className="my-2 space-y-1">
              {result.stats?.originalSize && (
                <li>Original Size: {result.stats.originalSize} bytes</li>
              )}
              {result.stats?.compressedSize && (
                <li>Compressed Size: {result.stats.compressedSize} bytes</li>
              )}
              {result.stats?.decompressedSize && (
                <li>Decompressed Size: {result.stats.decompressedSize} bytes</li>
              )}
              {result.stats?.ratio && (
                <li>
                  Compression Ratio: {result.stats.ratio.toFixed(2)}%
                </li>
              )}
              {result.stats?.time && <li>Processing Time: {result.stats.time} ms</li>}
            </ul>

            {result.fileUrl && (
              <a
                href={result.fileUrl}
                download
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                ⬇️ Download {mode === "compress" ? "Compressed" : "Decompressed"} File
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
