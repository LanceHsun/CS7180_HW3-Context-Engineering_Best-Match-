---
name: resume-parsing
description: Procedures for AI-powered resume parsing and Pydantic validation.
---

# Resume Parsing Skill

Guidelines for extracting data from PDF resumes using the Gemini 1.5 Pro API and validating it with backend models.

## Extraction Flow

1. **Input:** PDF Binary/Blob.
2. **AI Action:** Send to Gemini 1.5 Pro with a structured extraction prompt.
3. **Logic:** 
   - Extract `Target Role`, `Skills`, `Experience`, and `Email`.
   - Normalize skills to a predefined list (e.g., "React.js" -> "React").
4. **Validation:** Pass result through Pydantic models in `/api/models`.

## Safety & Accuracy

- **Sanitation:** All AI-extracted text MUST be sanitized before rendering to prevent XSS.
- **Error Handling:** If parsing fails, allow the user to manually enter details.
- **Resume Preservation:** Strictly DO NOT rewrite or modify the original resume content.

## Implementation Examples
- Refer to `ScanLine` component in prototype for visual feedback during parsing.
- Use Zod for client-side validation of extracted data before submission.
