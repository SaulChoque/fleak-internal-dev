// Configuración actualizada para Google Gemini
export const GEMINI_CONFIG = {
  apiKey: process.env.API_KEY_GEMINI || '',
  model: "models/gemini-pro-latest",
  endpoint: "https://generativelanguage.googleapis.com/v1beta",
  maxTokens: 1000,
  temperature: 0.7
} as const;

// Modelo verificado: 2025-10-25T02:54:04.141Z
// Respuesta de prueba: Es **plausible**, pero como evidencia es **débil**.
