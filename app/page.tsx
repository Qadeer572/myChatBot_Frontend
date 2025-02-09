import Link from "next/link";
import Head from "next/head";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <head>
        <title>ChatLink</title>
      </head>
       
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4 dark:text-white">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Welcome to Our Platform
        </h1>
        <p className="text-slate-600 max-w-[600px] mx-auto text-lg dark:text-slate-300">
          Get started by creating an account or signing in to access your dashboard.
        </p>
        <div className="flex gap-4 justify-center">
        <Button asChild variant="outline" size="lg" className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white rounded-lg shadow-lg hover:from-purple-500 hover:via-pink-600 hover:to-red-600">
              <Link href="/chat">Chat</Link>
          </Button>
          
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/signup">Create Account</Link>
          </Button>

          <Button asChild size="lg">
            <Link href="/auth/login">Sign In</Link>
          </Button>
          
        </div>
      </div>
    </div>
    </div>
  );
}
