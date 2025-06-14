'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Theorem } from '@/lib/theorems';
import { cn } from '@/lib/utils';

interface TheoremComboboxProps {
  theorems: Theorem[];
  selectedValue: string | undefined; // This is the actual theorem name string
  onValueChange: (value: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  emptyMessage?: string;
}

export function TheoremCombobox({
  theorems,
  selectedValue,
  onValueChange,
  disabled,
  placeholder = 'Select theorem...',
  emptyMessage = 'No theorem found.',
}: TheoremComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-sm font-normal text-foreground h-10"
          disabled={disabled}
        >
          {selectedValue ? selectedValue : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search theorem..." className="text-sm h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {theorems.map(theorem => (
                <CommandItem
                  key={theorem.id}
                  value={theorem.name}
                  onSelect={currentValue => {
                    onValueChange(currentValue);
                    setOpen(false);
                  }}
                  className="text-sm cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedValue === theorem.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {theorem.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
