import { useAccountListBackup } from "../../../pages/api/account/list-backup";
import dayjs from "dayjs";
import Button from "@italodeandra/ui/components/Button/Button";
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import { useSnapshot } from "valtio";
import { state } from "../../state";

export function BackupButton() {
  let { selectedAccounts } = useSnapshot(state);
  let { isFetching, refetch } = useAccountListBackup({
    enabled: false,
  });

  let download = async () => {
    let { data } = await refetch();
    if (data) {
      let element = document.createElement("a");
      let file = new Blob(
        [
          JSON.stringify(
            data.filter(
              (r) =>
                !selectedAccounts.length || selectedAccounts.includes(r._id)
            ),
            null,
            2
          ),
        ],
        {
          type: "text/plain",
        }
      );
      element.href = URL.createObjectURL(file);
      element.download = `backup-facebot-${dayjs().format(
        "YYYY-MM-DD-HH-mm"
      )}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <Button
      leading={<ArrowDownTrayIcon />}
      loading={isFetching}
      onClick={download}
    >
      Backup
    </Button>
  );
}
