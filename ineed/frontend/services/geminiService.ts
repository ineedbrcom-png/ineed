import { GoogleGenAI, Type } from "@google/genai";
import type { ModerationResult, ContractGenerationResult } from '../types';

// WARNING: Storing API keys on the client-side is insecure and should only be done for prototyping.
// In a production environment, this key MUST be stored on a secure backend server and all calls
// must be proxied through that server.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("API_KEY for Gemini is not set. AI features will be disabled.");
}

/**
 * Checks if the request content is appropriate using Gemini.
 */
export const checkRequestContentWithAI = async (text: string): Promise<ModerationResult> => {
    if (!ai) return { isInappropriate: false, reason: 'AI moderation disabled.' };
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following text from a service request platform. Is it inappropriate, unsafe, illegal, or against general content policies (e.g., hate speech, harassment, spam, scams, adult content)? Respond in JSON format. Your response MUST be a JSON object with two keys: "isInappropriate" (boolean) and "reason" (string, explaining why it's inappropriate, or "Content is appropriate." if it's fine). Text to analyze: "${text}"`,
        });

        // Clean the response to ensure it's valid JSON
        const jsonString = response.text.trim().replace(/```json|```/g, '');
        const result = JSON.parse(jsonString);
        
        return {
            isInappropriate: result.isInappropriate || false,
            reason: result.reason || 'No reason provided.'
        };
    } catch (error) {
        console.error("Gemini moderation check failed:", error);
        // Fail open: assume content is appropriate if AI check fails, to not block users.
        return { isInappropriate: false, reason: 'AI check failed.' };
    }
};

/**
 * Generates a contract summary from a conversation transcript.
 */
export const generateContractWithAI = async (transcript: string): Promise<ContractGenerationResult> => {
    if (!ai) throw new Error("AI features are disabled. API_KEY is not configured.");
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following conversation transcript from a service negotiation platform. Extract the agreed upon value (in BRL), a concise service description, and the delivery time. Respond with a valid JSON object containing three keys: "value" (number or null), "serviceDescription" (string or null), and "deliveryTime" (string or null). If a value is not explicitly agreed upon, return null for that key. Transcript:\n\n${transcript}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.NUMBER, description: "The final agreed price in BRL. Can be null if not found." },
                        serviceDescription: { type: Type.STRING, description: "A summary of the service or product being delivered. Can be null if not found." },
                        deliveryTime: { type: Type.STRING, description: "The agreed upon delivery time or deadline. Can be null if not found." },
                    }
                }
            }
        });

        const jsonStr = response.text.trim();
        const parsedResult = JSON.parse(jsonStr) as ContractGenerationResult;
        return parsedResult;

    } catch (error) {
        console.error("Gemini contract generation failed:", error);
        throw new Error("A IA não conseguiu gerar o contrato. Verifique se os termos foram acordados claramente na conversa.");
    }
};

/**
 * Generates a friendly welcome message for a new user.
 */
export const getAIWelcomeMessageWithAI = async (): Promise<{ message: string }> => {
    if (!ai) return { message: "Bem-vindo(a) ao iNeed! Estamos felizes em ter você aqui. Explore os pedidos ou crie uma nova solicitação para começar." };
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate a short, friendly, and welcoming message for a new user joining 'iNeed', a platform that connects people in a community. The tone should be encouraging. Max 2 sentences.",
        });
        return { message: response.text };
    } catch (error) {
        console.error("Gemini welcome message failed:", error);
        return { message: "Bem-vindo(a) ao iNeed! Sua comunidade te espera." };
    }
};