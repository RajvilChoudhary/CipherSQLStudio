// backend/utils/llmHint.js
// Handles communication with AI (Gemini or OpenAI)
// CRITICAL: We engineer the prompt so AI gives HINTS only, NOT full solutions
// This is called "prompt engineering" - crafting the exact instructions for the AI

const fetch = require('node-fetch');

/**
 * Builds the system prompt for the LLM
 * The system prompt sets the AI's "role" and rules for this conversation
 */
const buildSystemPrompt = () => {
  return `You are a SQL tutor assistant for CipherSQLStudio, a platform where students learn SQL.

Your STRICT rules:
1. NEVER provide the complete SQL solution or a working query that directly solves the problem
2. NEVER write SQL code that would directly answer the assignment question
3. Give conceptual hints, ask guiding questions, and explain relevant SQL concepts
4. Point students in the right direction without revealing the exact answer
5. If the student's query has errors, explain WHAT type of error it is without fixing it for them
6. Keep hints under 150 words
7. Be encouraging and supportive

You CAN:
- Explain what a SQL clause does (e.g., "GROUP BY groups rows with the same value in a column")
- Point out which SQL concept is relevant to this problem
- Ask guiding questions like "What clause would you use to filter rows?"
- Explain error messages in plain English
- Suggest what to search/study

You CANNOT:
- Write the actual SQL query or significant parts of it
- Show what the correct WHERE/JOIN/GROUP BY conditions should be
- Reveal column names or table names not already given in the question`;
};

/**
 * Builds the user message with full context
 */
const buildUserMessage = (assignment, userQuery, errorMessage) => {
  let message = `Assignment: "${assignment.title}"
  
Question: ${assignment.question}

Available Tables: ${assignment.sampleTables.map(t => 
  `${t.tableName} (${t.columns.map(c => `${c.columnName}: ${c.dataType}`).join(', ')})`
).join('; ')}`;

  if (userQuery && userQuery.trim()) {
    message += `\n\nStudent's current query:\n${userQuery}`;
  }

  if (errorMessage) {
    message += `\n\nError received: ${errorMessage}`;
  }

  message += '\n\nPlease give a helpful hint (NOT the solution) to guide this student.';
  
  return message;
};

/**
 * Gets hint from Google Gemini API
 */
const getGeminiHint = async (systemPrompt, userMessage) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n---\n\n${userMessage}` }]
      }
    ],
    generationConfig: {
      maxOutputTokens: 250,
      temperature: 0.7,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Gemini raw error:', err);
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate hint.';
};

/**
 * Gets hint from OpenAI API
 */
const getOpenAIHint = async (systemPrompt, userMessage) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 250,
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Unable to generate hint.';
};

/**
 * Main function: Gets a hint from whichever LLM is configured
 */
const getLLMHint = async (assignment, userQuery = '', errorMessage = '') => {
  const systemPrompt = buildSystemPrompt();
  const userMessage = buildUserMessage(assignment, userQuery, errorMessage);
  
  const provider = process.env.LLM_PROVIDER || 'gemini';

  try {
    if (provider === 'openai') {
      return await getOpenAIHint(systemPrompt, userMessage);
    } else {
      return await getGeminiHint(systemPrompt, userMessage);
    }
  } catch (error) {
    console.error('LLM Error:', error.message);
    throw error;
  }
};

module.exports = { getLLMHint };
