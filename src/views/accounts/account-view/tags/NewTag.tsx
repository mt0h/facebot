import { PlusIcon } from "@heroicons/react/20/solid";
import Button from "@italodeandra/ui/components/Button/Button";
import { useState } from "react";
import { TagForm } from "./TagForm";

export function NewTag({
  accountId,
  excludeLabels,
}: {
  accountId: string;
  excludeLabels?: string[];
}) {
  let [adding, setAdding] = useState(false);

  if (adding) {
    return (
      <TagForm
        accountId={accountId}
        onSave={() => setAdding(false)}
        excludeLabels={excludeLabels}
      />
    );
  }

  return (
    <Button
      leading={<PlusIcon />}
      variant="outlined"
      onClick={() => setAdding(true)}
    >
      Nova etiqueta
    </Button>
  );
}
