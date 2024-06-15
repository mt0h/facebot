import DropdownMenu from "@italodeandra/ui/components/DropdownMenu";
import Button from "@italodeandra/ui/components/Button";
import { pull } from "lodash";
import { TaskStatus } from "../../collections/Task";

let statusList = [
  TaskStatus.DONE,
  TaskStatus.ERROR,
  TaskStatus.TIMEOUT,
  TaskStatus.PENDING,
  TaskStatus.IN_PROGRESS,
  TaskStatus.CANCELLED,
];

function translateTaskStatus(status: TaskStatus) {
  return {
    [TaskStatus.DONE]: "Finalizado",
    [TaskStatus.ERROR]: "Erro",
    [TaskStatus.TIMEOUT]: "Timeout",
    [TaskStatus.PENDING]: "Pendente",
    [TaskStatus.IN_PROGRESS]: "Em progresso",
    [TaskStatus.CANCELLED]: "Cancelado",
  }[status];
}

export function StatusFilter({
  status,
  setStatus,
}: {
  status: TaskStatus[];
  setStatus: (status: TaskStatus[]) => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="filled" className="overflow-hidden">
          <span
            className="truncate"
            title={
              status.length === 0
                ? "Todos status"
                : `Status: ${status.map(translateTaskStatus).join(", ")}`
            }
          >
            {status.length === 0
              ? "Todos status"
              : `Status: ${status.map(translateTaskStatus).join(", ")}`}
          </span>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.CheckboxItem
          checked={status.length === statusList.length}
          onCheckedChange={(checked) => {
            setStatus(checked ? statusList || [] : []);
          }}
        >
          Todos
        </DropdownMenu.CheckboxItem>
        {statusList.map((statusItem) => (
          <DropdownMenu.CheckboxItem
            key={statusItem}
            checked={status.includes(statusItem)}
            onCheckedChange={(checked) => {
              setStatus(
                checked
                  ? [...status, statusItem]
                  : pull([...status], statusItem)
              );
            }}
          >
            {translateTaskStatus(statusItem)}
          </DropdownMenu.CheckboxItem>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
