import { UseFormReturn } from "react-hook-form";
import { PanelUserFieldValues } from "@italodeandra/auth/views/Panel/Users/PanelUserFieldValues";
import Input from "@italodeandra/ui/components/Input/Input";
import DateTimeInput from "@italodeandra/ui/components/DateInput/DateTimeInput";

export function UserCustomFields({
  form,
  isLoadingFields,
}: {
  form: UseFormReturn<PanelUserFieldValues>;
  isLoadingFields: boolean;
}) {
  let {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <Input
        label="Limite de perfil"
        select
        {...register("customData.accountLimit", {
          required: "Selecione um limite",
        })}
        loading={isLoadingFields}
        required
        error={!!errors.customData?.accountLimit}
        helpText={errors.customData?.accountLimit?.message}
      >
        <option value={100}>100</option>
        <option value={250}>250</option>
        <option value={400}>400</option>
        <option value={500}>500</option>
        <option value={1000}>1000</option>
        <option value={999999}>Ilimitado</option>
      </Input>
      <DateTimeInput
        label="Data da expiração do acesso"
        {...register("customData.expirationDate", {
          required: "Preencher com a data",
        })}
        required
        error={!!errors.customData?.expirationDate}
        helpText={errors.customData?.expirationDate?.message}
      />
    </>
  );
}
