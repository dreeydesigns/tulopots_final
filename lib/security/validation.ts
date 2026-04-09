import { z } from 'zod';
import { normalizeExternalUrl } from '@/lib/security/links';

const emailSchema = z.string().trim().email();
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  scope: z.enum(['customer', 'admin']).optional(),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1),
  email: emailSchema,
  phone: z.string().trim().optional().default(''),
  password: z.string().min(8),
  acceptTerms: z.boolean(),
  acceptPrivacy: z.boolean(),
  marketingConsent: z.boolean().optional().default(false),
  preferredLanguage: z.string().trim().optional(),
  preferredCurrency: z.string().trim().optional(),
  defaultShippingCountry: z.string().trim().optional(),
});

export const contactSchema = z.object({
  company: z.string().trim().optional().default(''),
  name: z.string().trim().min(1),
  email: emailSchema,
  subject: z.string().trim().optional().default(''),
  message: z.string().trim().min(1),
  context: z.string().trim().optional().default(''),
  imageUrl: z.string().trim().optional().default(''),
});

export const newsletterSchema = z.object({
  company: z.string().trim().optional().default(''),
  name: z.string().trim().optional().default(''),
  email: emailSchema,
  preferredChannel: z.string().trim().optional().default('email'),
  source: z.string().trim().optional().default('footer'),
  interests: z.array(z.string().trim().min(1)).optional().default([]),
});

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().trim().min(1),
      })
    )
    .min(1),
  pathname: z.string().trim().optional(),
  search: z.string().trim().optional(),
  accountType: z.enum(['guest', 'customer', 'admin']).optional(),
});

export const whatsappSchema = z.object({
  name: z.string().trim().optional().default(''),
  phone: z.string().trim().optional().default(''),
  email: z.string().trim().optional().default(''),
  summary: z.string().trim().optional().default('General enquiry'),
});

export const paymentOrderIdSchema = z.object({
  orderId: z.string().trim().min(1),
  paymentSnapshot: z.string().trim().optional().default(''),
});

export const mpesaSchema = z.object({
  orderId: z.string().trim().min(1),
  phone: phoneSchema,
  paymentSnapshot: z.string().trim().optional().default(''),
});

export const studioSchema = z.object({
  message: z.string().trim().optional().default(''),
  imageFileName: z.string().trim().optional().default(''),
  imagePreview: z.string().trim().optional().default(''),
  referenceLink: z.string().trim().optional().default(''),
  space: z.string().trim().min(1),
  helpType: z.string().trim().min(1),
  extraNote: z.string().trim().optional().default(''),
});

export function sanitizeText(value: string, maxLength = 1200) {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function sanitizeMultilineText(value: string, maxLength = 4000) {
  return value.replace(/\r/g, '').trim().slice(0, maxLength);
}

export function sanitizeUrl(value: string) {
  return normalizeExternalUrl(value);
}
