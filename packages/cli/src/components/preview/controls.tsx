import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Controls = () => {
  return (
    <div className="flex gap-2">
      <Select defaultValue="Valid">
        <SelectTrigger>
          <SelectValue placeholder="Select a status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Valid">
            <div className="size-2.5 rounded-full bg-green-500" />
            Valid (12)
          </SelectItem>
          <SelectItem value="Invalid">
            <div className="size-2.5 rounded-full bg-destructive" />
            Invalid (1)
          </SelectItem>
          <SelectItem value="Missing">
            <div className="size-2.5 rounded-full bg-yellow-500" />
            Missing (1)
          </SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="Production">
        <SelectTrigger>
          <SelectValue placeholder="Select an environment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Production">Production</SelectItem>
          <SelectItem value="Staging">Staging</SelectItem>
          <SelectItem value="Development">Development</SelectItem>
        </SelectContent>
      </Select>

      <Input placeholder="Search for a variable..." />
      <Button variant="outline">
        <Copy className="size-4" />
        Copy to clipboard
      </Button>
    </div>
  );
};
