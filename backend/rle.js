export function compressRLE(inputBuffer) {
  const input = inputBuffer.toString("utf-8");
  let result = "";
  let i = 0;
  while (i < input.length) {
    let count = 1;
    while (i + 1 < input.length && input[i] === input[i + 1]) {
      count++;
      i++;
    }
    result += input[i] + count;
    i++;
  }
  return Buffer.from(result, "utf-8");
}

export function decompressRLE(compressedBuffer) {
  const compressed = compressedBuffer.toString("utf-8");
  let output = "";
  for (let i = 0; i < compressed.length; i += 2) {
    const char = compressed[i];
    const count = parseInt(compressed[i + 1]);
    if (isNaN(count)) throw new Error("Invalid RLE format");
    output += char.repeat(count);
  }
  return Buffer.from(output, "utf-8");
}
