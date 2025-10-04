// // schemas/agentSchemas.ts
// import { z } from 'zod';

// const name = z.string().min(3).max(40);
// const ticker = z.string().min(2).max(8).regex(/^[A-Z0-9]+$/, 'Uppercase A–Z/0–9 only');
// const shortDescription = z.string().min(10).max(200);
// const category = z.enum(['meme','research','defi','nft','social','other']);

// export const basicsSchema = z.object({
//   name, ticker, shortDescription, category,
// });

// export const personaSchema = z.object({
//   voiceTone: z.enum(['playful','serious','degenerate','wholesome','analyst']),
//   bio: z.string().min(30).max(1500),
//   coreTraits: z.array(z.string().min(2).max(20)).max(5),
//   systemPrompt: z.string().min(30).max(4000),
// });

// const fileSchema = z
//   .instanceof(File)
//   .refine(f => ['image/png','image/jpeg','image/webp'].includes(f.type), 'PNG/JPG/WEBP only')
//   .refine(f => f.size <= 8 * 1024 * 1024, 'Max 8MB');

// export const mediaSchema = z.object({
//   avatar: fileSchema,
//   banner: z.instanceof(File).optional().nullable(),
//   avatarAlt: z.string().min(3).max(80),
// });

// export const socialsSchema = z.object({
//   twitter: z.string().url().optional().or(z.literal('')),
//   website: z.string().url().optional().or(z.literal('')),
//   discord: z.string().url().optional().or(z.literal('')),
//   launchType: z.enum(['create-only','create-then-coin']),
//   agreeToTerms: z.literal(true), // must be checked
// });

// export const fullSchema = basicsSchema
//   .and(personaSchema)
//   .and(mediaSchema)
//   .and(socialsSchema);

import { z } from "zod";

// Step 1: Jurisdiction
export const jurisdictionSchema = z.object({
  jurisdictionType: z.enum(["business", "individual"]),
  country: z.string().min(1, "Please select a country"),
});

// Step 2: Contact Details
export const contactSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  telegram: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  documents: z.any().optional(), // File uploads
}).refine(
  (data) => data.email || data.telegram,
  { message: "At least one contact method is required", path: ["email"] }
);

// Step 3: Knowledge Base
export const knowledgeSchema = z.object({
  knowledgeFiles: z.any().optional(),
  websiteUrls: z.array(z.string().url()).optional(),
  newsFilters: z.array(z.string()).optional(),
});

// Step 4: Character Personality
export const characterSchema = z.object({
  masterPrompt: z.string().min(10, "Please describe your ZEE's personality"),
  twitterAccounts: z.string().optional(),
});

// Step 5: Spokesperson Visual
export const visualSchema = z.object({
  spokespersonType: z.enum(["upload", "preset"]),
  uploadedPhoto: z.any().optional(),
  presetAvatar: z.string().optional(),
});

// Step 6: Voice Setup
export const voiceSchema = z.object({
  voiceType: z.enum(["preset", "upload"]),
  presetVoice: z.string().optional(),
  voiceSample: z.any().optional(),
});

// Step 7: Agent Setup
export const agentSetupSchema = z.object({
  tradingModel: z.enum(["foundational", "custom"]),
  predictionMarkets: z.array(z.string()).optional(),
});

// Step 8: Review (validates everything)
export const fullZeeSchema = z.object({
  ...jurisdictionSchema.shape,
  ...contactSchema.shape,
  ...knowledgeSchema.shape,
  ...characterSchema.shape,
  ...visualSchema.shape,
  ...voiceSchema.shape,
  ...agentSetupSchema.shape,
  agreeToTerms: z.boolean().refine((v) => v === true, "You must agree to terms"),
});

export type ZeeForm = z.infer<typeof fullZeeSchema>;