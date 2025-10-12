// // src/schema/agent-schemas.ts
// import { z } from "zod";

// /* ───────────────────────── Step 1: Jurisdiction ───────────────────────── */
// export const jurisdictionSchema = z.object({
//   jurisdictionType: z.enum(["business", "individual"], {
//     required_error: "Please select whether you are a business or an individual",
//   }),
//   country: z.string().min(1, "Please select a country"),
// });

// /* ────────────────────────── Step 2: Contact ─────────────────────────────
//    Define a *base* object; use a refined version for the step,
//    and use the base when merging into the full schema. */
// const contactBase = z.object({
//   email: z.string().email("Enter a valid email").optional().or(z.literal("")),
//   telegram: z.string().optional(),
//   website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
//   documents: z.any().optional(),
// });
// export const contactSchema = contactBase.refine(
//   (data) => !!data.email || !!data.telegram,
//   { message: "At least one contact method is required", path: ["email"] }
// );

// /* ───────────────────────── Step 3: Knowledge ──────────────────────────── */
// export const knowledgeSchema = z.object({
//   knowledgeFiles: z.any().optional(),           // File | File[] | FileList (normalized in UI)
//   websiteUrls: z.array(z.string().url()).optional(),
//   newsFilters: z.array(z.string()).optional(),
// });

// /* ───────────────────────── Step 4: Character ──────────────────────────── */
// export const characterSchema = z.object({
//   masterPrompt: z
//     .string()
//     .min(10, "Please describe your ZEE's personality (min 10 chars)"),
//   twitterAccounts: z.string().optional(),
// });

// /* ────────────────────────── Step 5: Visual ────────────────────────────── */
// export const visualSchema = z.object({
//   spokespersonType: z.enum(["upload", "preset"]),
//   uploadedPhoto: z.any().optional(),   // File when upload
//   presetAvatar: z.string().optional(), // id when preset
// });

// /* ────────────────────────── Step 6: Voice ───────────────────────────────
//    Backend will accept uploaded file; keep both controls in schema. */
// export const voiceSchema = z.object({
//   voiceType: z.enum(["preset", "upload"]),
//   presetVoice: z.string().optional(),  // when preset
//   voiceSample: z.any().optional(),     // File when upload
// });

// /* ───────────────────────── Step 7: Agent Setup ────────────────────────── */
// export const agentSetupSchema = z.object({
//   tradingModel: z.enum(["foundational", "custom"]),
//   predictionMarkets: z.array(z.string()).optional(),
//   selectedAgents: z.array(z.string()).optional(),
// });

// /* ───────────────────────── Step 8: Full Review ──────────────────────────
//    Merge ONLY base/objects (no ZodEffects), then add one superRefine with
//    all cross-field rules (including the contact rule again). */
// const fullZeeBase = jurisdictionSchema
//   .merge(contactBase)
//   .merge(knowledgeSchema)
//   .merge(characterSchema)
//   .merge(visualSchema)
//   .merge(voiceSchema)
//   .merge(agentSetupSchema)
//   .extend({
//     agreeToTerms: z.literal(true, {
//       errorMap: () => ({ message: "You must agree to terms" }),
//     }),
//   });

// export const fullZeeSchema = fullZeeBase.superRefine((data, ctx) => {
//   // Contact rule (mirror the step rule)
//   if (!data.email && !data.telegram) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       path: ["email"],
//       message: "At least one contact method is required",
//     });
//   }

//   // If spokespersonType is upload, require uploadedPhoto
//   if (data.spokespersonType === "upload" && !data.uploadedPhoto) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       path: ["uploadedPhoto"],
//       message: "Please upload a spokesperson photo",
//     });
//   }

//   // If voiceType is upload, require voiceSample file
//   if (data.voiceType === "upload" && !data.voiceSample) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       path: ["voiceSample"],
//       message: "Please upload a voice sample",
//     });
//   }

//   // (Optional) Require at least one knowledge source
//   // if (!data.knowledgeFiles && !(data.websiteUrls?.length)) {
//   //   ctx.addIssue({
//   //     code: z.ZodIssueCode.custom,
//   //     path: ["knowledgeFiles"],
//   //     message: "Provide at least one knowledge file or website URL",
//   //   });
//   // }
// });

// export type ZeeForm = z.infer<typeof fullZeeSchema>;

// src/schema/agent-schemas.ts
import { z } from "zod";

/* ───────────────────────── Step 1: Jurisdiction ───────────────────────── */
export const jurisdictionSchema = z.object({
  jurisdictionType: z.enum(["business", "individual"], {
    required_error: "Please select whether you are a business or an individual",
  }),
  country: z.string().min(1, "Please select a country"),
});

/* ────────────────────────── Step 2: Contact ─────────────────────────────
   Define a *base* object; use a refined version for the step,
   and use the base when merging into the full schema. */
const contactBase = z.object({
  name: z
    .string()
    .min(2, "Please enter your ZEE name (min 2 characters)")
    .max(64, "Name is too long"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  telegram: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  documents: z.any().optional(),
});
export const contactSchema = contactBase.refine(
  (data) => !!data.email || !!data.telegram,
  { message: "At least one contact method is required", path: ["email"] }
);

/* ───────────────────────── Step 3: Knowledge ──────────────────────────── */
export const knowledgeSchema = z.object({
  knowledgeFiles: z.any().optional(),           // File | File[] | FileList (normalized in UI)
  websiteUrls: z.array(z.string().url()).optional(),
  newsFilters: z.array(z.string()).optional(),
});

/* ───────────────────────── Step 4: Character ──────────────────────────── */
export const characterSchema = z.object({
  masterPrompt: z
    .string()
    .min(10, "Please describe your ZEE's personality (min 10 chars)"),
  twitterAccounts: z.string().optional(),
});

/* ────────────────────────── Step 5: Visual ────────────────────────────── 
   SIMPLIFIED: Only file upload, optional */
export const visualSchema = z.object({
  spokespersonType: z.enum(["upload", "preset"]).optional(),
  spokespersonUpload: z.any().optional(),   // File - using the actual field name
  uploadedPhoto: z.any().optional(),        // For compatibility
  presetAvatar: z.string().optional(),
});

/* ────────────────────────── Step 6: Voice ───────────────────────────────
   SIMPLIFIED: Only file upload, optional */
export const voiceSchema = z.object({
  voiceType: z.enum(["preset", "upload"]).optional(),
  presetVoice: z.string().optional(),
  voiceSample: z.any().optional(),     // File when upload
});

/* ───────────────────────── Step 7: Agent Setup ────────────────────────── */
export const agentSetupSchema = z.object({
  tradingModel: z.enum(["foundational", "custom"]),
  predictionMarkets: z.array(z.string()).optional(),
  selectedAgents: z.array(z.string()).optional(),
  zeeType: z.enum(["enterprise", "coin-launch"]).optional(),
   paymentStatus: z.boolean().default(false).optional(),
});

/* ───────────────────────── Step 8: Full Review ──────────────────────────
   SIMPLIFIED: Visual and Voice are optional, no validation required */
const fullZeeBase = jurisdictionSchema
  .merge(contactBase)
  .merge(knowledgeSchema)
  .merge(characterSchema)
  .merge(visualSchema)
  .merge(voiceSchema)
  .merge(agentSetupSchema)
  .extend({
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: "You must agree to terms" }),
    }),
  });

export const fullZeeSchema = fullZeeBase.superRefine((data, ctx) => {
  // Contact rule (mirror the step rule)
  if (!data.email && !data.telegram) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "At least one contact method is required",
    });
  }

  // REMOVED validation for spokespersonType and voiceType - they're optional now
  // Visual and Voice are optional, so no validation needed
});