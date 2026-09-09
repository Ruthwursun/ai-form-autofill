const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---- Health check ----
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ---- Extraction endpoint ----
app.post('/api/extract', upload.single('document'), async (req, res) => {
  try {
    let schema = [];
    if (req.body && req.body.schema) {
      try {
        schema = typeof req.body.schema === 'string' ? JSON.parse(req.body.schema) : req.body.schema;
      } catch (e) {
        schema = [];
      }
    }

    if (!schema || !Array.isArray(schema) || schema.length === 0) {
      return res.status(400).json({
        error: 'No form fields found. Please build the form first before uploading a document.'
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }

    const mimeType = req.file.mimetype;
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(mimeType)) {
      return res.status(400).json({ error: `Unsupported file type: ${mimeType}. Please upload a PDF, PNG, or JPG.` });
    }

    const base64Data = req.file.buffer.toString('base64');

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: { responseMimeType: 'application/json' }
    });

    // Build a schema description dynamically — this is the core "no hardcoding" requirement
    const fieldDescriptions = schema.map(f =>
      `- id: "${f.id}", label: "${f.label}", type: "${f.type}"${f.required ? ' (required)' : ''}`
    ).join('\n');

    const prompt = `You are a document data extraction engine. You will be given a document and a form schema.

FORM SCHEMA (extract exactly these fields, nothing else):
${fieldDescriptions}

INSTRUCTIONS:
- Read the document carefully and extract values matching each field above.
- For "date" type fields, return in YYYY-MM-DD format if possible.
- For "number" type fields, return only the numeric value, no units or text.
- For "checkbox" type fields, return true or false based on whether the document indicates agreement/presence.
- For "dropdown" type fields, return the closest matching text value found.
- If a value is not present or you are not confident, set "found" to false and "value" to null. NEVER guess or hallucinate a value.
- Assign "confidence" as "high", "medium", or "low" based on how directly the value appears in the document.

Return ONLY valid JSON in this exact structure, no markdown, no explanation:
{
  "field_id_here": { "value": "extracted value or null", "found": true, "confidence": "high" }
}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } }
    ]);

    let responseText = result.response.text().trim();
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    const extracted = JSON.parse(responseText);

    res.json({ success: true, extracted });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Extraction failed. The document may be corrupted or unreadable.', detail: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
