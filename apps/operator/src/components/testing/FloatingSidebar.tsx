import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Search, Home, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface FloatingSidebarProps {
  items?: SidebarItem[];
}

const defaultItems: SidebarItem[] = [
  { icon: Home, label: 'Inicio', active: true },
  { icon: BarChart3, label: 'Reportes' },
  { icon: Search, label: 'Buscar' },
  { icon: Settings, label: 'Ajustes' },
  { icon: User, label: 'Perfil' },
];

export const FloatingSidebar: React.FC<FloatingSidebarProps> = ({ items = defaultItems }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="fixed left-2 md:left-4 top-1/2 -translate-y-1/2 z-40"
    >
      <div className="bg-card/95 backdrop-blur-xl rounded-xl md:rounded-2xl p-1.5 md:p-2 shadow-soft-lg border border-white/50 flex flex-col gap-1.5 md:gap-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.onClick}
              className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center transition-colors",
                item.active
                  ? "gradient-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              title={item.label}
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
