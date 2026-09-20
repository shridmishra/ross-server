"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconFileText } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
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
              <IconFileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Terms of Service
              </h1>
              <p className="text-sm text-muted-foreground">
                Last updated: January 2026 &bull; MATUR.ai AI Governance & Compliance Platform
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-foreground/90 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3 bg-card/40 border border-border/60 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the MATUR.ai platform (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of an enterprise or other legal entity, you represent that you have the authority to bind such entity to these terms.
            </p>
          </section>

          <section className="space-y-3 bg-card/40 border border-border/60 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">2. Description of Services</h2>
            <p>
              MATUR.ai provides AI compliance readiness evaluation, risk tier classification, and automated testing tools designed to assist organizations in preparing for AI governance standards (including the EU AI Act, NIST AI RMF, and ISO/IEC 42001).
            </p>
            <p className="text-muted-foreground">
              <strong>Disclaimer:</strong> While MATUR.ai provides software tools, assessment workflows, and automated evaluations, our services do not constitute formal legal counsel, statutory regulatory certifications, or notified body audit findings. Organizations remain responsible for their own legal and regulatory compliance.
            </p>
          </section>

          <section className="space-y-3 bg-card/40 border border-border/60 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">3. User Responsibilities & Acceptable Use</h2>
            <p>You agree not to use the platform to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Upload malicious software, destructive scripts, or unlawful content.</li>
              <li>Attempt unauthorized access to other tenant environments or project data.</li>
              <li>Circumvent account tier limits, evaluation quotas, or authentication protections.</li>
              <li>Reverse-engineer or exploit proprietary assessment methodologies without express permission.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-card/40 border border-border/60 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">4. Intellectual Property & Customer Content</h2>
            <p>
              You retain all right, title, and interest in and to your proprietary data, models, test artifacts, and compliance evidence. MATUR.ai retains all intellectual property rights in the software platform, assessment question libraries, and scoring algorithms.
            </p>
          </section>

          <section className="space-y-3 bg-card/40 border border-border/60 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground">5. Contact Information</h2>
            <p>
              For legal questions, notices, or terms clarification, please contact:
            </p>
            <p className="font-mono text-sm text-primary">
              <a href="mailto:legal@matur.ai" className="hover:underline">legal@matur.ai</a>
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>&copy; {new Date().getFullYear()} MATUR.ai. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground underline">Privacy Policy</Link>
            <Link href="/auth" className="hover:text-foreground underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
