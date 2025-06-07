import * as Twoslash from "fumadocs-twoslash/ui";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    Steps,
    Step,
    img: (props) => (
      <span className="p-2 bg-muted rounded-lg inline-block">
        <ImageZoom
          {...props}
          className={cn("rounded-md my-0!", props.className)}
        />
      </span>
    ),
    ...Twoslash,
    ...components,
  };
}
