'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-12 h-12" />
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all active:scale-90"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'dark' ? (
            <Moon className="h-5 w-5 text-blue-400" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-400" />
          )}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
