import { NextResponse } from "next/server";

type ProgressTask = {
  label: string;
  done: boolean;
};

type ProgressPhase = {
  id: string;
  label: string;
  status: "not_started" | "in_progress" | "complete";
  percent: number;
  tasks: ProgressTask[];
};

type ProgressPayload = {
  lastUpdated: string;
  phases: ProgressPhase[];
};

const phases: ProgressPhase[] = [
  {
    id: "admin",
    label: "Admin / CMS System",
    status: "in_progress",
    percent: 0,
    tasks: [
      { label: "Dashboard with live counts", done: false },
      { label: "Product CRUD", done: false },
      { label: "Order management", done: false },
      { label: "Studio brief inbox", done: false },
      { label: "Contact messages viewer", done: false },
      { label: "Newsletter list", done: false },
      { label: "Admin auth/access control", done: false }
    ]
  },
  {
    id: "products",
    label: "Product Database System",
    status: "not_started",
    percent: 0,
    tasks: [
      { label: "Prisma Product model", done: false },
      { label: "Seed script from lib/products.ts", done: false },
      { label: "API updated to serve from DB", done: false },
      { label: "Frontend connected to DB", done: false }
    ]
  },
  {
    id: "content",
    label: "Content Management",
    status: "not_started",
    percent: 0,
    tasks: [
      { label: "SiteSection Prisma model", done: false },
      { label: "Admin content tab", done: false },
      { label: "Frontend respects visibility flags", done: false }
    ]
  },
  {
    id: "auth",
    label: "Auth System Hardening",
    status: "not_started",
    percent: 0,
    tasks: [
      { label: "User model with isAdmin", done: false },
      { label: "Proper session management", done: false },
      { label: "Admin route protection", done: false },
      { label: "Customer auth flow", done: false }
    ]
  },
  {
    id: "conversion",
    label: "Conversion Improvement",
    status: "not_started",
    percent: 0,
    tasks: [
      { label: "Product page persuasion layer", done: false },
      { label: "Cart hardening", done: false },
      { label: "Checkout flow stability", done: false },
      { label: "Trust signals", done: false }
    ]
  },
  {
    id: "seo",
    label: "SEO System",
    status: "not_started",
    percent: 0,
    tasks: [
      { label: "Dynamic metadata all pages", done: false },
      { label: "Open Graph tags", done: false },
      { label: "Structured data (JSON-LD)", done: false },
      { label: "Image alt attributes", done: false }
    ]
  },
  {
    id: "reviews",
    label: "Reviews & Trust System",
    status: "not_started",
    percent: 0,
    tasks: [
      { label: "Review Prisma model", done: false },
      { label: "Review form on product pages", done: false },
      { label: "Admin moderation", done: false },
      { label: "Display on product pages", done: false }
    ]
  },
  {
    id: "social",
    label: "Social & Brand Integration",
    status: "not_started",
    percent: 0,
    tasks: [
      { label: "Share buttons", done: false },
      { label: "OG images per product", done: false },
      { label: "Campaign route stubs", done: false }
    ]
  },
  {
    id: "polish",
    label: "Premium Frontend Polish",
    status: "not_started",
    percent: 0,
    tasks: [
      { label: "Micro-interactions", done: false },
      { label: "Loading/error/empty states", done: false },
      { label: "Mobile audit", done: false },
      { label: "Typography + spacing audit", done: false }
    ]
  }
];

export async function GET() {
  const payload: ProgressPayload = {
    lastUpdated: new Date().toISOString(),
    phases
  };

  return NextResponse.json(payload, {
    headers: {
      "cache-control": "no-store, max-age=0"
    }
  });
}
