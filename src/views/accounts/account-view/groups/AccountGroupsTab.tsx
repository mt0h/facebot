import { AccountGroups } from "./AccountGroups";
import { AccountGetApiResponse } from "../../../../pages/api/account/get";
import Stack from "@italodeandra/ui/components/Stack";
import Button from "@italodeandra/ui/components/Button";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import Text from "@italodeandra/ui/components/Text";
import Input from "@italodeandra/ui/components/Input";
import { useForm } from "react-hook-form";
import { useAccountGroupCreate } from "../../../../pages/api/account-group/create";

interface FieldValues {
  id: string;
  name: string;
}

function AccountGroupForm({
  accountId,
  onSave,
}: {
  accountId: AccountGetApiResponse["_id"];
  onSave?: () => void;
}) {
  let {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FieldValues>();

  let { mutate: create, isLoading } = useAccountGroupCreate({
    onSuccess() {
      onSave?.();
    },
  });

  let onSubmit = (values: FieldValues) => {
    create({
      ...values,
      accountId,
    });
  };

  return (
    <Stack>
      <Text variant="label" size="lg">
        Novo grupo
      </Text>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Input
          label="URL"
          {...register("id", { required: "Preencher com a URL do grupo" })}
          required
          helpText={errors.id?.message}
        />
        <Input
          label="Nome"
          {...register("name", { required: "Preencher com o nome do grupo" })}
          required
          error={!!errors.name}
          helpText={errors.name?.message}
        />
        <Button
          variant="filled"
          color="success"
          type="submit"
          loading={isLoading}
        >
          Salvar
        </Button>
      </form>
    </Stack>
  );
}

export function AccountGroupsTab({
  account,
}: {
  account: AccountGetApiResponse;
}) {
  let [showForm, setShowForm] = useState(false);

  return (
    <Stack className="flex-1">
      {showForm ? (
        <AccountGroupForm
          accountId={account._id}
          onSave={() => setShowForm(false)}
        />
      ) : (
        <Stack className="flex-1">
          <Button leading={<PlusIcon />} onClick={() => setShowForm(true)}>
            Novo
          </Button>
          <AccountGroups account={account} />
        </Stack>
      )}
    </Stack>
  );
}
