import { describe, it, expect } from 'vitest';
import { sanitizeOutput, IcebreakerSchema } from '../services/aiService';

describe('AI Pipeline & Security', () => {
    it('should sanitize potentially malicious HTML output', () => {
        const dirty = 'Hi <script>alert("xss")</script> <b>there</b>';
        const clean = sanitizeOutput(dirty);
        expect(clean).not.toContain('<script>');
        expect(clean).toContain('<b>there</b>');
    });

    it('should validate JSON structure against schemas', () => {
        const validJson = {
            greeting: "Hello",
            interest: "AI",
            callToAction: "Connect?",
            rawText: "Hello AI Connect?"
        };
        const parsed = IcebreakerSchema.parse(validJson);
        expect(parsed.greeting).toBe("Hello");
    });

    it('should throw error for invalid schema data', () => {
        const invalidJson = { g: "Hi" };
        expect(() => IcebreakerSchema.parse(invalidJson)).toThrow();
    });
});
