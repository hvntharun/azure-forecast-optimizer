import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClassificationCategory } from "@/lib/classificationData";

interface CategorySelectorProps {
  selected: ClassificationCategory;
  onSelect: (category: ClassificationCategory) => void;
}

const supervisedOptions: ClassificationCategory[] = ['XGBoost', 'Random Forest', 'Decision Trees'];
const unsupervisedOptions: ClassificationCategory[] = ['KMeans', 'DBScan', 'Hierarchical'];

export function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  const [supervisedOpen, setSupervisedOpen] = useState(false);
  const [unsupervisedOpen, setUnsupervisedOpen] = useState(false);

  const isSupervised = supervisedOptions.includes(selected);
  const isUnsupervised = unsupervisedOptions.includes(selected);

  return (
    <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl border border-border/50 w-fit">
      <Button
        variant={selected === 'Analytics' ? 'default' : 'ghost'}
        onClick={() => onSelect('Analytics')}
        className="rounded-lg font-medium"
      >
        Analytics
      </Button>

      <DropdownMenu open={supervisedOpen} onOpenChange={setSupervisedOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isSupervised ? 'default' : 'ghost'}
            className="rounded-lg font-medium gap-2"
          >
            {isSupervised ? selected : 'Supervised Learning'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 glass-effect">
          {supervisedOptions.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => {
                onSelect(option);
                setSupervisedOpen(false);
              }}
              className={selected === option ? 'bg-primary/10 text-primary' : ''}
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu open={unsupervisedOpen} onOpenChange={setUnsupervisedOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isUnsupervised ? 'default' : 'ghost'}
            className="rounded-lg font-medium gap-2"
          >
            {isUnsupervised ? selected : 'Unsupervised Learning'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 glass-effect">
          {unsupervisedOptions.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => {
                onSelect(option);
                setUnsupervisedOpen(false);
              }}
              className={selected === option ? 'bg-primary/10 text-primary' : ''}
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
