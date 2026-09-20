"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconShieldCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              MATUR.ai Legal
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <IconShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Privacy Policy
              </h1>
              <p className="text-sm text-muted-foreground">
                Last updated: January 2026 &bull; MATUR.ai AI Governance & Compliance Platform
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-foreground/90 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3 bg-card/40 border border-border/60 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">1. Overview & Commitment</h2>
            <p>
              MATUR.ai (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to safeguarding the privacy and security of your organization&rsquo;s data. This Privacy Policy describes how we collect, use, store, and protect information when you access our AI compliance readiness, governance assessment, and evaluation services.
            </p>
          </section>

          <section className="space-y-3 bg-card/40 border border-border/60 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <p>We collect only the information necessary to provide AI governance and compliance evaluations:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Account Information:</strong> Name, work email address, organization name, and authentication credentials.</li>
              <li><strong className="text-foreground">Evaluation Inputs:</strong> Test prompts, uploaded evaluation datasets (including CSV files for bias testing), model configuration parameters, and target API endpoint details. Target API authentication credentials (such as API keys and authorization headers) provided for automated testing are utilized ephemerally to execute evaluation requests and are sanitized and stripped prior to storing report artifacts.</li>
              <li><strong className="text-foreground">Evaluation Outputs & Analysis:</strong> Metric breakdowns, persisted report previews, audit summaries, and derived test prompt snippets submitted to evaluation models (such as Google Gemini and Anthropic Claude) strictly for automated fairness, bias, and vulnerability scoring.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-card/40 border border-border/60 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">3. How We Use Information</h2>
            <p>Your data is processed strictly for the following operational purposes:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Generating compliance readiness scores, maturity evaluations, and risk reports.</li>
              <li>Executing requested automated evaluations (vulnerability scanning, fairness testing).</li>
              <li>Maintaining project audit trails and compliance evidence archives.</li>
              <li>We <strong className="text-foreground">never sell your data</strong> or use your proprietary compliance evidence to train public AI models.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-card/40 border border-border/60 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">4. Data Security & Retention</h2>
            <p>
              We implement industry-standard technical and organizational security controls, including TLS encryption in transit, AES-256 encryption at rest, role-based access control, and row-level tenant isolation. Evaluation logs and temporary datasets are retained in accordance with your project lifecycle settings and subscription plan.
            </p>
          </section>

          <section className="space-y-3 bg-card/40 border border-border/60 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">5. Contact Information</h2>
            <p>
              For privacy inquiries, data subject access requests, or questions regarding our security practices, contact our Data Protection team at:
            </p>
            <p className="font-mono text-sm text-primary">
              <a href="mailto:privacy@matur.ai" className="hover:underline">privacy@matur.ai</a>
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>&copy; {new Date().getFullYear()} MATUR.ai. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground underline">Terms of Service</Link>
            <Link href="/auth" className="hover:text-foreground underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
