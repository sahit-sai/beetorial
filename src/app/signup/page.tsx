'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { GraduationCap, Users, BookOpen, Shield, ArrowRight, CheckCircle2 } from 'lucide-react'
import { signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Logo } from '@/components/ui/logo'

const initialState = {
  error: null as string | null,
}

const roles = [
  {
    value: 'student',
    title: 'Student',
    description: 'Attend classes, read notes, and track progress',
    icon: GraduationCap,
  },
  {
    value: 'parent',
    title: 'Parent',
    description: 'Monitor your child\'s schedule and CRM reports',
    icon: Users,
  },
  {
    value: 'mentor',
    title: 'Mentor',
    description: 'Teach assignments, grade quizzes, and upload notes',
    icon: BookOpen,
  },
  {
    value: 'admin',
    title: 'Admin',
    description: 'Run matches, match mentors, and manage billing',
    icon: Shield,
  },
]

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState)
  const [activeRole, setActiveRole] = React.useState('student')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-[#070710] transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#0f0f20] shadow-[0_8px_30px_rgb(60_50_207/0.04),0_2px_8px_rgb(0_0_0/0.02)] border border-slate-100 dark:border-slate-800 mb-4 hover:scale-105 transition-transform duration-200">
          <Logo className="w-10 h-10 text-[#3C32CF] dark:text-[#5146e5]" />
        </div>
        <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight dark:text-slate-50 leading-none">
          Join Beetorial
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-sans">
          Create an account and match with the perfect study companion
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card className="rounded-2xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f0f20] shadow-[0_8px_30px_rgb(60_50_207/0.04),0_2px_8px_rgb(0_0_0/0.02)]">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-heading font-extrabold text-center">Create account</CardTitle>
            <CardDescription className="text-center font-sans">
              Sign up today and get access to 1-on-1 tutoring sessions
            </CardDescription>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-6 pb-6">
              {state?.error && (
                <Alert variant="destructive" className="rounded-xl shadow-sm">
                  <AlertDescription className="font-sans text-xs">{state.error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-sans text-sm font-semibold">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Jenkins"
                    required
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/40 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:ring-2 font-sans"
                  />
                </div>

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
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-sans text-sm font-semibold">Password (min 6 characters)</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/40 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:ring-2 font-sans"
                />
              </div>

              <div className="space-y-3">
                <Label className="font-sans text-sm font-semibold">Select your role</Label>
                <RadioGroup 
                  name="role" 
                  value={activeRole}
                  onValueChange={setActiveRole}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {roles.map((role) => {
                    const Icon = role.icon
                    const isSelected = activeRole === role.value
                    return (
                      <Label
                        key={role.value}
                        htmlFor={`role-${role.value}`}
                        className={`flex items-start p-4 rounded-xl border cursor-pointer bg-card shadow-sm transition-all duration-300 relative ${
                          isSelected 
                            ? 'border-[#3C32CF] dark:border-[#5146e5] ring-2 ring-[#3C32CF]/10 dark:ring-[#5146e5]/10 scale-[1.01] translate-y-[-1px]' 
                            : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                        }`}
                      >
                        <RadioGroupItem
                          value={role.value}
                          id={`role-${role.value}`}
                          className="sr-only"
                        />
                        <div className="flex h-full gap-3">
                          <div className={`p-2 rounded-lg mt-0.5 shrink-0 transition-colors duration-200 ${
                            isSelected ? 'bg-[#3C32CF]/10 text-[#3C32CF] dark:bg-[#5146e5]/20 dark:text-[#5146e5]' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-heading font-bold text-sm block text-slate-900 dark:text-slate-50">
                              {role.title}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1 leading-normal font-normal font-sans">
                              {role.description}
                            </span>
                          </div>
                        </div>
                      </Label>
                    )
                  })}
                </RadioGroup>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pb-8">
              <Button 
                type="submit" 
                className="w-full h-11 text-sm font-heading font-bold rounded-xl bg-[#3C32CF] hover:bg-[#2f27a6] dark:bg-[#5146e5] dark:hover:bg-[#4338ca] text-white shadow-md active:scale-98 transition-all duration-200" 
                disabled={isPending}
              >
                {isPending ? 'Registering...' : 'Register'}
                {!isPending && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
              <div className="text-center text-sm text-slate-600 dark:text-slate-400 font-sans">
                Already have an account?{' '}
                <Link href="/login" className="text-[#3C32CF] dark:text-[#5146e5] hover:underline font-semibold">
                  Sign in instead
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
