import { Form } from "@/components/variables/form";
import { FileContent } from "@/components/variables/preview";

export const Variables = () => {
  return (
    <div className="flex gap-4 min-h-0 h-full">
      <Form />
      <FileContent />
    </div>
  );
};
