"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextType {
  openItem: string | null;
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

export function Accordion({
  children,
  className,
  collapsible = true,
}: {
  children: React.ReactNode;
  className?: string;
  type?: string;
  collapsible?: boolean;
}) {
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  const toggleItem = (val: string) => {
    setOpenItem((prev) => (prev === val ? (collapsible ? null : prev) : val));
  };

  return (
    <AccordionContext.Provider value={{ openItem, toggleItem }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

const ItemContext = React.createContext<{ value: string; isOpen: boolean } | null>(null);

export function AccordionItem({
  children,
  className,
  value,
}: {
  children: React.ReactNode;
  className?: string;
  value: string;
}) {
  const ctx = React.useContext(AccordionContext);
  const isOpen = ctx?.openItem === value;

  return (
    <ItemContext.Provider value={{ value, isOpen }}>
      <div data-state={isOpen ? "open" : "closed"} className={cn("border-b", className)}>
        {children}
      </div>
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const itemCtx = React.useContext(ItemContext);
  const accordionCtx = React.useContext(AccordionContext);
  const isOpen = itemCtx?.isOpen;

  return (
    <div className="flex">
      <button
        type="button"
        data-state={isOpen ? "open" : "closed"}
        onClick={() => itemCtx && accordionCtx?.toggleItem(itemCtx.value)}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left",
          className,
        )}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
    </div>
  );
}

export function AccordionContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const itemCtx = React.useContext(ItemContext);
  if (!itemCtx?.isOpen) return null;

  return (
    <div className="overflow-hidden text-sm animate-in fade-in duration-200">
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </div>
  );
}
