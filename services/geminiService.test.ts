import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateImpactMessage } from './geminiService';

// Mock the GoogleGenAI module
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
    generateContent: mockGenerateContent
}));

vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: class {
            models = {
                generateContent: mockGenerateContent
            };
        }
    };
});

describe('geminiService', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should return a fallback message if no client (API key missing)', async () => {
        // We can simulate missing API key by not setting it in process.env or just trusting the mock behavior if we control it.
        // However, the module reads process.env.API_KEY at the top or inside function.
        // The current implementation reads it inside `getClient`.

        // We can't easily unload the module to change the constant if it was top-level, but `getClient` is called every time.
        const originalEnv = process.env;
        process.env = { ...originalEnv, API_KEY: '' };

        const msg = await generateImpactMessage(100, 'Test User');
        expect(msg).toContain('Thank you, Test User!');
        expect(msg).toContain('$100');

        process.env = originalEnv;
    });

    it('should call Gemini API if client exists', async () => {
        process.env.API_KEY = 'test-key';

        mockGenerateContent.mockResolvedValue({
            text: 'Your donation helped plant a tree.'
        });

        const msg = await generateImpactMessage(50, 'Donor');

        expect(mockGenerateContent).toHaveBeenCalled();
        // Logic inside service handles response structure.
        // Our mock returns object with text property if we matched the GoogleGenAI SDK types?
        // Wait, the real SDK returns a response object where result.response.text() is a function usually, 
        // BUT the service code uses specific import '@google/genai'.
        // Let's re-read the service code carefully.
        // `response.text` property is accessed: `return response.text?.trim() ...` 
        // So our mock returning { text: ... } is correct for THAT specific usage.

        expect(msg).toBe('Your donation helped plant a tree.');
    });

    it('should handle API errors gracefully', async () => {
        process.env.API_KEY = 'test-key';
        mockGenerateContent.mockRejectedValue(new Error('API Fail'));

        const msg = await generateImpactMessage(50, 'Donor');

        expect(msg).toContain('Thank you'); // Fallback
    });
});
