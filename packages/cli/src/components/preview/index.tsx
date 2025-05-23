import { Controls } from "@/components/preview/controls";
import { FileContent } from "@/components/preview/file-content";
import { Form } from "@/components/preview/form";

type PreviewProps = {
  config: any;
};

export const Preview = ({ config }: PreviewProps) => {
  return (
    <>
      <Controls />
      <div className="flex gap-4 min-h-0 h-full">
        {/* <Form config={config} /> */}
        <FileContent />
      </div>
    </>
  );
};
