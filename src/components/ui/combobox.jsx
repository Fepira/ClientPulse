import React, { useState } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export function Combobox({ options, value, onValueChange, placeholder, searchPlaceholder, emptyPlaceholder, isLoading }) {
  const [open, setOpen] = useState(false);

  const displayValue = options.find((option) => option.value.toLowerCase() === value?.toLowerCase())?.label || "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between input-field text-left font-normal"
        >
          <span className="truncate">
            {value ? displayValue : placeholder}
          </span>
          {isLoading ? <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function MultiSelectCombobox({ options, selected, onChange, placeholder, searchPlaceholder, emptyPlaceholder, isLoading }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (currentValue) => {
    const newSelected = selected.includes(currentValue)
      ? selected.filter((item) => item !== currentValue)
      : [...selected, currentValue];
    onChange(newSelected);
  };

  const handleRemove = (valueToRemove) => {
    onChange(selected.filter((item) => item !== valueToRemove));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <div className="flex flex-wrap gap-1 rounded-md border border-input bg-background p-2 min-h-[40px] w-full cursor-pointer relative pr-10">
            {selected.length === 0 && <span className="text-muted-foreground text-sm px-1 py-0.5">{placeholder}</span>}
            {selected.map((value) => (
              <Badge key={value} variant="secondary" className="flex items-center gap-1">
                {options.find(o => o.value === value)?.label || value}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(value);
                  }}
                  className="rounded-full hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
             <div className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 flex items-center justify-center">
              {isLoading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />}
            </div>
          </div>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}