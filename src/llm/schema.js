const { z } = require("zod");

const taskInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
});

const taskOutputSchema = z.object({
  category: z.enum(["development", "marketing", "design", "bug", "other"]),
  urgency: z.enum(["low", "normal", "high"]),
  effort: z.enum(["small", "medium", "large"]),
  confidence: z.number().min(0).max(1),
});

module.exports = {
  taskInputSchema,
  taskOutputSchema,
};
