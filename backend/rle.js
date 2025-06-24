
export function rleCompress(data) {
  let compressed = "";
  let count = 1;

  for (let i = 1; i <= data.length; i++) {
    if (data[i] === data[i - 1]) {
      count++;
    } else {
      compressed += data[i - 1] + count;
      count = 1;
    }
  }

  return compressed;
}

export function rleDecompress(data) {
  let decompressed = "";
  for (let i = 0; i < data.length; i += 2) {
    const char = data[i];
    const count = parseInt(data[i + 1]);
    decompressed += char.repeat(count);
  }
  return decompressed;
}
