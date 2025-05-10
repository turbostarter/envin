import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Copy } from "lucide-react";

export const Controls = () => {
  return (
    <div className="flex gap-2">
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

      {/* <Select defaultValue="Valid">
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Valid">Valid</SelectItem>
              <SelectItem value="Invalid">Invalid</SelectItem>
              <SelectItem value="Missing">Missing</SelectItem>
            </SelectContent>
          </Select> */}

      <Input placeholder="Search for a variable..." />
      <Button variant="outline">
        <Copy className="size-4" />
        Copy to clipboard
      </Button>
    </div>
  );
};
