function cosine(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// حساب المتوسط لعدة embeddings
function averageEmbeddings(embeddings) {
  if (!embeddings.length) return [];
  const len = embeddings[0].length;
  const avg = new Array(len).fill(0);
  embeddings.forEach(vec => {
    vec.forEach((v, i) => avg[i] += v);
  });
  return avg.map(v => v / embeddings.length);
}

module.exports = { cosine, averageEmbeddings };
