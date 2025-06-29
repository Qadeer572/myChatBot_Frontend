import Link from "next/link";
import Head from "next/head";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center px-4 py-12 md:py-16 lg:py-20">
      <div className="text-center space-y-6 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight">
          Welcome to Our Platform
        </h1>
        <p className="text-slate-600 max-w-[600px] mx-auto text-base sm:text-lg md:text-xl">
          Get started by creating an account or signing in to access your dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-8">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto bg-white hover:bg-slate-50 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            <Link href="/auth/signup">Create Account</Link>
          </Button>

          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}