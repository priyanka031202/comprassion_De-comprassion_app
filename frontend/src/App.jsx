import { useState } from "react";

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
      setResult(null);
      setError("");

      const response = await fetch(
        `http://localhost:5000/${mode}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">
           File {mode === "compress" ? "Compression" : "Decompression"} App
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full border p-2 rounded"
          />

          <div className="flex justify-between">
            <label>
              <input
                type="radio"
                value="compress"
                checked={mode === "compress"}
                onChange={() => setMode("compress")}
              />
              <span className="ml-2">Compress</span>
            </label>
            <label>
              <input
                type="radio"
                value="decompress"
                checked={mode === "decompress"}
                onChange={() => setMode("decompress")}
              />
              <span className="ml-2">Decompress</span>
            </label>
          </div>

          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="rle">Run-Length Encoding (RLE)</option>
            <option value="huffman">Huffman Coding</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
            disabled={loading}
          >
            {loading
              ? mode === "compress"
                ? "Compressing..."
                : "Decompressing..."
              : mode === "compress"
              ? " Compress File"
              : " Decompress File"}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-600 font-medium text-center">{error}</div>
        )}

        {result && (
          <div className="mt-6 bg-gray-50 p-4 border rounded">
            <h2 className="font-semibold text-lg mb-2"> Success</h2>
            <p>{result.message}</p>
            <ul className="mt-2 text-sm text-gray-700 space-y-1">
              {result.stats.originalSize !== undefined && (
                <li> Original Size: {result.stats.originalSize} bytes</li>
              )}
              {result.stats.compressedSize !== undefined && (
                <li> Compressed Size: {result.stats.compressedSize} bytes</li>
              )}
              {result.stats.decompressedSize !== undefined && (
                <li> Decompressed Size: {result.stats.decompressedSize} bytes</li>
              )}
              {result.stats.ratio !== undefined && (
                <li> Compression Ratio: {result.stats.ratio.toFixed(2)}%</li>
              )}
              <li> Processing Time: {result.stats.time} ms</li>
            </ul>

            <a
              href={result.fileUrl}
              download
              className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              ⬇️ Download {mode === "compress" ? "Compressed" : "Decompressed"} File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
