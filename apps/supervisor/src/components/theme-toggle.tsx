"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Dark Mode Toggle with system preference detection
 */
export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check localStorage or system preference
        const stored = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const dark = stored === "dark" || (!stored && prefersDark);
        setIsDark(dark);
        document.documentElement.classList.toggle("dark", dark);
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        document.documentElement.classList.toggle("dark", newDark);
        localStorage.setItem("theme", newDark ? "dark" : "light");
    };

    if (!mounted) return null;

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9"
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
            {isDark ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </Button>
    );
}
