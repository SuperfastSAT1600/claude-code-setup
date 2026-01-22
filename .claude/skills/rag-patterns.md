# RAG (Retrieval-Augmented Generation) Patterns

Patterns and best practices for building effective RAG systems that combine retrieval with LLM generation.

---

## RAG Architecture

### Basic Flow
```
User Query
    ↓
Query Processing (expand, rewrite)
    ↓
Vector Search (find relevant docs)
    ↓
Reranking (improve relevance)
    ↓
Context Assembly (format for LLM)
    ↓
LLM Generation (answer with context)
    ↓
Response
```

### Components
1. **Document Ingestion**: Process and chunk documents
2. **Embedding Model**: Convert text to vectors
3. **Vector Database**: Store and search embeddings
4. **Retriever**: Find relevant documents
5. **Reranker**: Improve retrieval quality
6. **Generator**: LLM that produces final answer

---

## Document Processing

### Chunking Strategies

**Fixed-Size Chunking**
```typescript
function chunkBySize(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
  }

  return chunks;
}

// Usage: 500 tokens with 50 token overlap
const chunks = chunkBySize(document, 500, 50);
```

**Semantic Chunking**
```typescript
function chunkBySentence(text: string, maxChunkSize: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}
```

**Hierarchical Chunking**
```typescript
interface HierarchicalChunk {
  id: string;
  content: string;
  summary: string;
  parentId?: string;
  children: string[];
  metadata: {
    level: 'document' | 'section' | 'paragraph';
    position: number;
  };
}

// Store summaries at different levels
// Query can retrieve at appropriate granularity
```

### Metadata Enrichment
```typescript
interface DocumentChunk {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    source: string;
    title: string;
    section: string;
    page?: number;
    createdAt: Date;
    updatedAt: Date;
    author?: string;
    tags: string[];
    // Custom metadata
    codeLanguage?: string;
    apiVersion?: string;
  };
}
```

---

## Embedding Strategies

### Model Selection
| Model | Dimensions | Use Case |
|-------|------------|----------|
| OpenAI text-embedding-3-small | 1536 | General purpose, cost-effective |
| OpenAI text-embedding-3-large | 3072 | Higher accuracy, larger storage |
| Cohere embed-v3 | 1024 | Multilingual support |
| Voyage-2 | 1024 | Code-optimized |

### Embedding Best Practices
```typescript
// 1. Normalize embeddings for cosine similarity
function normalizeEmbedding(embedding: number[]): number[] {
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

// 2. Use instruction-tuned embeddings
const queryEmbedding = await embedder.embed(
  `query: ${userQuery}`,  // Prefix for queries
  { inputType: 'search_query' }
);

const docEmbedding = await embedder.embed(
  `passage: ${documentText}`,  // Prefix for documents
  { inputType: 'search_document' }
);
```

---

## Retrieval Strategies

### Hybrid Search
Combine vector similarity with keyword matching.

```typescript
async function hybridSearch(query: string, k: number = 10): Promise<Document[]> {
  // Vector search
  const vectorResults = await vectorDb.similaritySearch(query, k * 2);

  // Keyword search (BM25)
  const keywordResults = await keywordDb.search(query, k * 2);

  // Reciprocal Rank Fusion
  const scores = new Map<string, number>();

  vectorResults.forEach((doc, i) => {
    const score = 1 / (60 + i);  // RRF constant = 60
    scores.set(doc.id, (scores.get(doc.id) || 0) + score);
  });

  keywordResults.forEach((doc, i) => {
    const score = 1 / (60 + i);
    scores.set(doc.id, (scores.get(doc.id) || 0) + score);
  });

  // Sort by combined score
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([id]) => getDocument(id));
}
```

### Multi-Query Retrieval
Generate multiple query variations to improve recall.

```typescript
async function multiQueryRetrieval(
  query: string,
  llm: LLM,
  retriever: Retriever
): Promise<Document[]> {
  // Generate query variations
  const variations = await llm.generate(`
    Generate 3 different versions of this question to retrieve relevant documents:
    Original: ${query}

    Variations:
  `);

  const allQueries = [query, ...parseVariations(variations)];

  // Retrieve for each query
  const allResults = await Promise.all(
    allQueries.map(q => retriever.retrieve(q, 5))
  );

  // Deduplicate and rerank
  const unique = deduplicateByContent(allResults.flat());
  return rerank(query, unique, 10);
}
```

### Contextual Compression
Compress retrieved documents to relevant portions.

```typescript
async function compressContext(
  query: string,
  documents: Document[],
  llm: LLM
): Promise<string[]> {
  return Promise.all(
    documents.map(async (doc) => {
      const compressed = await llm.generate(`
        Extract only the parts relevant to answering: "${query}"

        Document:
        ${doc.content}

        Relevant excerpt (or "NOT_RELEVANT" if nothing applies):
      `);

      return compressed === 'NOT_RELEVANT' ? null : compressed;
    })
  ).then(results => results.filter(Boolean));
}
```

---

## Reranking

### Cross-Encoder Reranking
```typescript
async function crossEncoderRerank(
  query: string,
  documents: Document[],
  topK: number
): Promise<Document[]> {
  const pairs = documents.map(doc => ({
    query,
    document: doc.content,
    originalDoc: doc,
  }));

  // Score each query-document pair
  const scores = await reranker.score(pairs);

  return pairs
    .map((pair, i) => ({ ...pair.originalDoc, score: scores[i] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
```

### LLM-Based Reranking
```typescript
async function llmRerank(
  query: string,
  documents: Document[],
  llm: LLM
): Promise<Document[]> {
  const prompt = `
    Rank these documents by relevance to: "${query}"

    Documents:
    ${documents.map((d, i) => `[${i}] ${d.content.slice(0, 200)}...`).join('\n\n')}

    Return a comma-separated list of document numbers, most relevant first:
  `;

  const ranking = await llm.generate(prompt);
  const indices = ranking.split(',').map(n => parseInt(n.trim()));

  return indices.map(i => documents[i]).filter(Boolean);
}
```

---

## Context Assembly

### Prompt Template
```typescript
function assembleContext(
  query: string,
  documents: Document[],
  conversationHistory?: Message[]
): string {
  return `
You are a helpful assistant that answers questions based on the provided context.

Context:
${documents.map((d, i) => `
[Source ${i + 1}: ${d.metadata.source}]
${d.content}
`).join('\n---\n')}

${conversationHistory ? `
Previous conversation:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}
` : ''}

Instructions:
- Answer based only on the provided context
- If the context doesn't contain the answer, say "I don't have enough information"
- Cite sources using [Source N] notation
- Be concise and accurate

Question: ${query}

Answer:
  `.trim();
}
```

### Citation Handling
```typescript
interface CitedResponse {
  answer: string;
  citations: {
    text: string;
    sourceIndex: number;
    source: string;
  }[];
}

function parseCitations(response: string, documents: Document[]): CitedResponse {
  const citationRegex = /\[Source (\d+)\]/g;
  const citations: CitedResponse['citations'] = [];

  let match;
  while ((match = citationRegex.exec(response)) !== null) {
    const index = parseInt(match[1]) - 1;
    if (documents[index]) {
      citations.push({
        text: match[0],
        sourceIndex: index,
        source: documents[index].metadata.source,
      });
    }
  }

  return { answer: response, citations };
}
```

---

## Evaluation

### Retrieval Metrics
```typescript
interface RetrievalMetrics {
  precision: number;    // Relevant retrieved / Total retrieved
  recall: number;       // Relevant retrieved / Total relevant
  mrr: number;          // Mean Reciprocal Rank
  ndcg: number;         // Normalized Discounted Cumulative Gain
}

function calculateMRR(results: Document[], relevantIds: Set<string>): number {
  for (let i = 0; i < results.length; i++) {
    if (relevantIds.has(results[i].id)) {
      return 1 / (i + 1);
    }
  }
  return 0;
}
```

### Generation Metrics
- **Faithfulness**: Does the answer only use provided context?
- **Relevance**: Does the answer address the question?
- **Coherence**: Is the answer well-structured?
- **Groundedness**: Can claims be traced to sources?

### RAGAS Evaluation
```typescript
// Using RAGAS framework for RAG evaluation
const evaluation = await ragas.evaluate({
  questions: testQuestions,
  groundTruths: expectedAnswers,
  contexts: retrievedContexts,
  answers: generatedAnswers,
  metrics: ['faithfulness', 'answer_relevancy', 'context_precision'],
});
```

---

## Optimization Patterns

### Caching
```typescript
class RAGCache {
  private queryCache: Map<string, Document[]>;
  private embeddingCache: Map<string, number[]>;

  async getCachedRetrieval(query: string): Promise<Document[] | null> {
    const normalized = query.toLowerCase().trim();
    return this.queryCache.get(normalized) || null;
  }

  async getCachedEmbedding(text: string): Promise<number[] | null> {
    const hash = createHash('sha256').update(text).digest('hex');
    return this.embeddingCache.get(hash) || null;
  }
}
```

### Query Routing
```typescript
async function routeQuery(query: string, llm: LLM): Promise<string> {
  const route = await llm.generate(`
    Classify this query into one of: [code, docs, general]

    Query: ${query}
    Classification:
  `);

  switch (route.trim().toLowerCase()) {
    case 'code':
      return 'code_index';
    case 'docs':
      return 'documentation_index';
    default:
      return 'general_index';
  }
}
```

---

## Common Issues & Solutions

### Problem: Irrelevant Results
- Add metadata filtering
- Implement reranking
- Tune similarity threshold
- Use hybrid search

### Problem: Missing Context
- Increase chunk overlap
- Use hierarchical chunking
- Implement multi-query retrieval
- Add parent document retrieval

### Problem: Hallucination
- Enforce stricter prompts
- Add fact-checking step
- Require citations
- Lower temperature

### Problem: Slow Performance
- Cache frequent queries
- Batch embedding requests
- Use approximate nearest neighbor
- Implement query routing

---

## Resources

- LangChain RAG: https://python.langchain.com/docs/use_cases/question_answering/
- LlamaIndex: https://docs.llamaindex.ai/
- RAGAS Evaluation: https://docs.ragas.io/
- Pinecone Best Practices: https://docs.pinecone.io/docs/overview
