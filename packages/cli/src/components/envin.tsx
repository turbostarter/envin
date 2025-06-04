import { Filters } from "@/components/filters";
import { FiltersProvider } from "@/components/filters/context";
import { Variables } from "@/components/variables";
import { VariablesProvider } from "@/components/variables/context";
import type { Variables as VariablesType } from "@/lib/types";

type EnvinProps = {
  readonly variables: VariablesType;
};

export const Envin = ({ variables }: EnvinProps) => {
  return (
    <FiltersProvider>
      <VariablesProvider variables={variables}>
        <Filters />
        <Variables />
      </VariablesProvider>
    </FiltersProvider>
  );
};
