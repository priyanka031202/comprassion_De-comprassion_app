// RLE compression
export function compressRLE(inputBuffer) {
  const input = inputBuffer.toString("utf-8");
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

  return Buffer.from(compressed, "utf-8");
}

// RLE decompression
export function decompressRLE(compressedBuffer) {
  const compressed = compressedBuffer.toString("utf-8");
  let decompressed = "";

  for (let i = 0; i < compressed.length; i += 2) {
    const char = compressed[i];
    const count = parseInt(compressed[i + 1], 10);

    if (isNaN(count)) {
      throw new Error("Invalid compressed format");
    }

    decompressed += char.repeat(count);
  }

  return Buffer.from(decompressed, "utf-8");
}
