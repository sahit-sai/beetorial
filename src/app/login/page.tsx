'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { login } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo } from '@/components/ui/logo'

const initialState = {
  error: null as string | null,
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-[#070710] transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#0f0f20] shadow-[0_8px_30px_rgb(60_50_207/0.04),0_2px_8px_rgb(0_0_0/0.02)] border border-slate-100 dark:border-slate-800 mb-4 hover:scale-105 transition-transform duration-200">
          <Logo className="w-10 h-10 text-[#3C32CF] dark:text-[#5146e5]" />
        </div>
        <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight dark:text-slate-50 leading-none">
          Beetorial
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-sans">
          Study with your personal mentor 1-on-1
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-[0_8px_30px_rgb(60_50_207/0.04),0_2px_8px_rgb(0_0_0/0.02)]">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-heading font-extrabold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center font-sans">
              Enter your credentials to access your student or parent workspace
            </CardDescription>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-4 pb-6">
              {state?.error && (
                <Alert variant="destructive" className="rounded-xl shadow-sm">
                  <AlertDescription className="font-sans text-xs">{state.error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans text-sm font-semibold">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@example.com"
                  required
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/40 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:ring-2 font-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-sans text-sm font-semibold">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/40 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:ring-2 font-sans"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pb-8">
              <Button 
                type="submit" 
                className="w-full h-11 text-sm font-heading font-bold rounded-xl bg-[#3C32CF] hover:bg-[#2f27a6] dark:bg-[#5146e5] dark:hover:bg-[#4338ca] text-white shadow-md active:scale-98 transition-all duration-200" 
                disabled={isPending}
              >
                {isPending ? 'Signing in...' : 'Sign in'}
                {!isPending && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
              <div className="text-center text-sm text-slate-600 dark:text-slate-400 font-sans">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-[#3C32CF] dark:text-[#5146e5] hover:underline font-semibold">
                  Create one now
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
