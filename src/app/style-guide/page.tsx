'use client'

import React, { useState } from 'react'
import { ArrowRight, CheckCircle2, AlertCircle, Info, Sparkles, Layout, Palette, Type, MousePointerClick, ShieldCheck, Sun, Moon } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function StyleGuidePage() {
  const [selectedRole, setSelectedRole] = useState('student')
  const [inputText, setInputText] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Toggle helper for testing dark mode colors on-screen
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#070710] dark:text-slate-100 ${isDarkMode ? 'dark' : ''}`}>
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-100 py-4 dark:bg-[#0f0f20] dark:border-slate-800 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90 dark:bg-[#0f0f20]/90">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9 text-[#3C32CF] dark:text-[#5146e5]" />
            <div>
              <span className="font-heading font-black text-xl tracking-tight text-[#0d0c1b] dark:text-slate-50 block leading-none">
                Beetorial
              </span>
              <span className="text-[10px] text-slate-400 font-sans tracking-widest uppercase">
                Design Tokens System
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleTheme}
            className="rounded-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            {isDarkMode ? <Sun className="w-4 h-4 mr-2 text-amber-500" /> : <Moon className="w-4 h-4 mr-2 text-[#3C32CF]" />}
            Simulate {isDarkMode ? 'Light' : 'Dark'} Mode
          </Button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto py-12 px-4 space-y-16">
        
        {/* Intro */}
        <header className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3C32CF]/10 text-[#3C32CF] dark:bg-[#5146e5]/10 dark:text-slate-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>V2.0 Redesign System</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-tight text-slate-900 dark:text-slate-50 leading-none">
            Beetorial System Guidelines
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            Crafted for trustworthiness and modern warmth. Built with **Nunito** for bold visual headings 
            and **DM Sans** for highly-legible layout body text.
          </p>
        </header>

        {/* Section 1: Colors */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Palette className="w-5 h-5 text-[#3C32CF]" />
            <h2 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-slate-50">
              1. Color Palette & Contrast
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Primary Accent */}
            <div className="bg-white dark:bg-[#0f0f20] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md flex flex-col justify-between h-44">
              <div className="w-full h-16 rounded-xl bg-[#3C32CF] dark:bg-[#5146e5] flex items-center justify-center text-white text-xs font-bold font-mono">
                #3C32CF / #5146E5
              </div>
              <div className="mt-2">
                <span className="font-heading font-bold text-sm block">Primary Brand Accent</span>
                <span className="text-xs text-slate-500 font-sans">Used for brand mark, primary actions, and highlights.</span>
              </div>
            </div>
            {/* Dark Slate */}
            <div className="bg-white dark:bg-[#0f0f20] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md flex flex-col justify-between h-44">
              <div className="w-full h-16 rounded-xl bg-[#0d0c1b] dark:bg-[#f1f0f7] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-white dark:text-slate-900 text-xs font-bold font-mono">
                #0D0C1B / #F1F0F7
              </div>
              <div className="mt-2">
                <span className="font-heading font-bold text-sm block">Text Foreground</span>
                <span className="text-xs text-slate-500 font-sans">Strict charcoal/slate. Prevents screen fatigue.</span>
              </div>
            </div>
            {/* Backgrounds */}
            <div className="bg-white dark:bg-[#0f0f20] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md flex flex-col justify-between h-44">
              <div className="w-full h-16 rounded-xl bg-[#fcfcfd] dark:bg-[#070710] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-900 dark:text-white text-xs font-bold font-mono">
                #FCFCFD / #070710
              </div>
              <div className="mt-2">
                <span className="font-heading font-bold text-sm block">Page Background</span>
                <span className="text-xs text-slate-500 font-sans">Soft cream-white or dark deep-sky background.</span>
              </div>
            </div>
            {/* Success green */}
            <div className="bg-white dark:bg-[#0f0f20] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md flex flex-col justify-between h-44">
              <div className="w-full h-16 rounded-xl bg-[#10b981] flex items-center justify-center text-white text-xs font-bold font-mono">
                #10B981
              </div>
              <div className="mt-2">
                <span className="font-heading font-bold text-sm block">Accent Success</span>
                <span className="text-xs text-slate-500 font-sans">Used strictly for test scores and green marks.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Typography */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Type className="w-5 h-5 text-[#3C32CF]" />
            <h2 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-slate-50">
              2. Typography System
            </h2>
          </div>
          <Card className="shadow-md border-slate-100 dark:border-slate-800 overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/30">
              <CardTitle className="font-heading text-lg">Nunito + DM Sans Pairing</CardTitle>
              <CardDescription>Soft and confident headers balanced by highly readable sans-serif body text.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase mb-1">Display Headings (Nunito Black 900)</span>
                <h1 className="text-4xl sm:text-5xl font-heading font-black text-slate-900 dark:text-slate-50 tracking-tight leading-none">
                  A personal mentor for every child.
                </h1>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase mb-1">Section Header (Nunito ExtraBold 800)</span>
                <h2 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-slate-50">
                  Attendance & Performance Tracker
                </h2>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase mb-1">Card Title (Nunito Bold 700)</span>
                <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-slate-50">
                  Mathematics — Chapter 4: Fractions
                </h3>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase mb-1">Body Text (DM Sans Regular 400)</span>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                  Next.js App Router intercepts requests in the proxy layer to confirm permissions before serving 
                  any layout shell. Mentors write weekly summaries that are instantly shared with parents.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Buttons */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <MousePointerClick className="w-5 h-5 text-[#3C32CF]" />
            <h2 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-slate-50">
              3. Interactive Buttons
            </h2>
          </div>
          <Card className="shadow-md border-slate-100 dark:border-slate-800 p-8 space-y-6">
            <div className="flex flex-wrap gap-4">
              {/* Primary action */}
              <Button className="h-11 px-6 font-heading font-bold rounded-xl shadow-md bg-[#3C32CF] hover:bg-[#2f27a6] text-white active:scale-98 transition-all duration-200">
                Book a Demo Class
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {/* Secondary action */}
              <Button variant="secondary" className="h-11 px-6 font-heading font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 active:scale-98 transition-all duration-200">
                View Notes Library
              </Button>
              {/* Outline */}
              <Button variant="outline" className="h-11 px-6 font-heading font-medium rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 active:scale-98 transition-all duration-200">
                View Past Invoices
              </Button>
              {/* Destructive */}
              <Button variant="destructive" className="h-11 px-6 font-heading font-semibold rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 transition-all duration-200">
                Delete Quiz Attempt
              </Button>
              {/* Disabled */}
              <Button disabled className="h-11 px-6 font-heading font-semibold rounded-xl">
                Class Closed
              </Button>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              *Buttons have subtle active scale micro-interactions (press down slightly to 98% scale) to mimic natural physical tactile responses.
            </p>
          </Card>
        </section>

        {/* Section 4: Custom Elements */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Layout className="w-5 h-5 text-[#3C32CF]" />
            <h2 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-slate-50">
              4. Form Inputs & Selection Cards
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input fields */}
            <Card className="shadow-md border-slate-100 dark:border-slate-800 p-6 space-y-6">
              <h3 className="font-heading font-bold text-lg">Input Fields & Feedback</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guide-name">Parent Full Name</Label>
                  <Input 
                    id="guide-name" 
                    placeholder="E.g., Sarah Jenkins" 
                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-offset-0 dark:border-slate-800 dark:bg-slate-900/50" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guide-email">Verification Email</Label>
                  <Input 
                    id="guide-email" 
                    type="email"
                    placeholder="sarah@example.com" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:ring-2 dark:border-slate-800 dark:bg-slate-900/50" 
                  />
                  {inputText && !inputText.includes('@') && (
                    <p className="text-xs text-red-500 font-sans flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-150">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Please specify a valid email syntax.
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Selection Cards (Asymmetric Choice Panels) */}
            <Card className="shadow-md border-slate-100 dark:border-slate-800 p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-lg">User Role Cards</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Click to preview active border and elevation shifts.</p>
              </div>
              <RadioGroup 
                value={selectedRole} 
                onValueChange={setSelectedRole} 
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {[
                  { id: 'student', title: 'Student', desc: 'Attends 1-on-1 calls' },
                  { id: 'parent', title: 'Parent', desc: 'Checks score logs' }
                ].map((item) => (
                  <Label
                    key={item.id}
                    htmlFor={`role-guide-${item.id}`}
                    className={`flex items-start p-4 rounded-xl border cursor-pointer bg-card shadow-sm transition-all duration-300 relative ${
                      selectedRole === item.id 
                        ? 'border-[#3C32CF] dark:border-[#5146e5] ring-2 ring-[#3C32CF]/10 dark:ring-[#5146e5]/10 scale-[1.01] translate-y-[-1px]' 
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <RadioGroupItem value={item.id} id={`role-guide-${item.id}`} className="sr-only" />
                    <div className="flex gap-3">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${
                        selectedRole === item.id ? 'text-[#3C32CF] dark:text-[#5146e5]' : 'text-slate-200 dark:text-slate-800'
                      }`} />
                      <div>
                        <span className="font-heading font-bold text-sm block">{item.title}</span>
                        <span className="text-xs text-slate-500 font-normal mt-0.5 block">{item.desc}</span>
                      </div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </Card>
          </div>
        </section>

        {/* Section 5: Ambient Shadows & Containers */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-[#3C32CF]" />
            <h2 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-slate-50">
              5. Ambient Elevation & Containers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Standard Card */}
            <div className="bg-white dark:bg-[#0f0f20] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
              <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase mb-1">Standard Card (.shadow-sm)</span>
              <h4 className="font-heading font-bold text-lg mb-2">Subject Notes: Fractions</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans mb-4">
                This is a regular list card containing a border and standard elevation. Perfect for repeating content tables and grids.
              </p>
              <Button variant="link" className="p-0 h-auto font-heading font-bold text-[#3C32CF] hover:underline">
                Read chapter note
              </Button>
            </div>

            {/* Premium Elevation Card */}
            <div className="bg-white dark:bg-[#0f0f20] rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-8 shadow-[0_8px_30px_rgb(60_50_207/0.04),0_2px_8px_rgb(0_0_0/0.02)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3C32CF]/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12 transition-transform duration-500 group-hover:scale-110"></div>
              <span className="text-[10px] font-mono text-[#3C32CF] dark:text-slate-300 block tracking-widest uppercase mb-1 font-bold">Premium Container (asymmetric, shadow-ambient)</span>
              <h4 className="font-heading font-black text-xl mb-2">Proctored Assessment 📝</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans mb-4">
                This container uses generous rounded corners (`rounded-3xl`), an ambient drop shadow, and a subtle glowing backdrop blur dot in the top right. Ideal for primary heroes or high-emphasis dashboards.
              </p>
              <Button className="font-heading font-bold bg-[#3C32CF] hover:bg-[#2f27a6] text-white rounded-xl shadow-md px-5">
                Start Exam Check
              </Button>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
