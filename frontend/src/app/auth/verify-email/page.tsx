"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { IconCircleCheck, IconCircleX, IconLoader2, IconArrowRight } from "@tabler/icons-react";
import { Skeleton } from "@/components/Skeleton";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async (token: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("Your email has been successfully verified!");
        } else {
          setStatus("error");
          setMessage(data.error || "Invalid or expired verification token.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification.");
      }
    };

    const token = searchParams.get("token");
    if (token) verifyEmail(token);
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-white dark:bg-black p-[14px]">
      {/* Left Pane - Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between py-4 px-6 sm:px-10 bg-white dark:bg-black overflow-y-auto">
        <div className="flex justify-between items-center w-full mb-4">
          <Link href="/" className="flex items-center">
            <span className="text-lg font-bold tracking-tight text-foreground">MATUR.ai</span>
          </Link>
          <Link href="/auth?isLogin=true" className="text-sm font-semibold text-foreground hover:underline">
            Sign In
          </Link>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4"
          >
            <h2 className="text-3xl font-bold mb-1 tracking-tight text-foreground">
              Email Verification
            </h2>
            <p className="text-sm text-muted-foreground">
              Verifying your email address
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-center">
              {status === "loading" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4"
                >
                  <Skeleton variant="circular" width="3.5rem" height="3.5rem" className="mx-auto mb-3" />
                  <Skeleton height="1rem" width="160px" className="mx-auto" />
                </motion.div>
              )}

              {status === "success" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4"
                >
                  <IconCircleCheck className="w-12 h-12 text-success mx-auto" />
                  <p className="mt-3 text-success text-sm font-medium">
                    {message}
                  </p>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4"
                >
                  <IconCircleX className="w-12 h-12 text-destructive mx-auto" />
                  <p className="mt-3 text-destructive text-sm font-medium">
                    {message}
                  </p>
                </motion.div>
              )}

              <div className="mt-6 space-y-3">
                {status === "success" && (
                  <Link href="/auth?isLogin=true" className="btn-auth-submit">
                    Sign In to Your Account
                    <IconArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                )}

                {status === "error" && (
                  <div className="space-y-2">
                    <Link href="/auth" className="btn-auth-submit">
                      Try Again
                      <IconArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                    <Button asChild variant="secondary" className="w-full h-10 text-sm">
                      <Link href="/">
                        Back to Home
                      </Link>
                    </Button>
                  </div>
                )}

                {status === "loading" && (
                  <p className="text-sm text-muted-foreground">
                    Please wait while we verify your email...
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Footer Row */}
        <div className="flex justify-between items-center w-full text-xs text-muted-foreground mt-4">
          <span>&copy; {new Date().getFullYear()} MATUR.ai</span>
          <div className="flex gap-3">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right Pane - Image */}
      <div className="hidden lg:block lg:w-[55%] relative">
        <div className="w-full h-full rounded-[12px] overflow-hidden shadow-lg relative">
          <img
            src="/auth_bg_light.png"
            alt="Auth visual"
            className="absolute inset-0 w-full h-full object-cover dark:hidden"
          />
          <img
            src="/auth_bg_dark.jpg"
            alt="Auth visual"
            className="absolute inset-0 w-full h-full object-cover hidden dark:block"
          />
        </div>
      </div>
    </div>
  );
}
