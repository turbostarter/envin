import { Controls } from "@/components/preview/controls";
import { FileContent } from "@/components/preview/file-content";
import { Form } from "@/components/preview/form";
import type { RJSFSchema } from "@rjsf/utils";

type PreviewProps = {
  schema: RJSFSchema;
};

export const Preview = ({ schema }: PreviewProps) => {
  return (
    <>
      <Controls />
      <div className="grid grid-cols-2 gap-4 grow">
        <Form schema={schema} />
        <FileContent />
      </div>
    </>
  );
};
