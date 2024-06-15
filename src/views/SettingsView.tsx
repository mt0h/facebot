import { useEffect, useMemo } from "react";
import { NextSeo } from "next-seo";
import Breadcrumbs from "@italodeandra/ui/components/Breadcrumbs/Breadcrumbs";
import Input from "@italodeandra/ui/components/Input/Input";
import { useForm } from "react-hook-form";
import { useSettingsGet } from "../pages/api/settings/get";
import Jsonify from "@italodeandra/next/utils/Jsonify";
import { ISettings } from "../collections/settings/Settings";
import { useSettingsUpdate } from "../pages/api/settings/update";
import Button from "@italodeandra/ui/components/Button/Button";
import Group from "@italodeandra/ui/components/Group/Group";

export type SettingsFieldValues = Jsonify<ISettings>;

export default function SettingsView() {
  let pages = useMemo(() => [{ title: "Configurações" }], []);

  let { data: settings, isFetching, isLoading } = useSettingsGet();

  let { register, handleSubmit, reset } = useForm<SettingsFieldValues>();

  useEffect(() => {
    if (settings) {
      reset(settings);
    } else {
      reset();
    }
  }, [reset, settings]);

  let { mutate: update, isLoading: isUpdating } = useSettingsUpdate();

  async function onSubmit(values: SettingsFieldValues) {
    if (!isUpdating) {
      update(values);
    }
  }

  return (
    <div className="flex flex-1 flex-col md:px-2 md:pb-2">
      <NextSeo title={pages[0].title} />
      <div className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col">
        <Breadcrumbs pages={pages} className="mb-2" loading={isFetching} />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 px-2 md:px-0"
        >
          <Input
            type="number"
            label="Quantidade de perfis simultâneos"
            {...register("simultaneousBrowserCount", { valueAsNumber: true })}
            loading={isLoading}
          />
          <Input
            type="number"
            label="Intervalo entre tarefas (segundos)"
            {...register("taskInterval", { valueAsNumber: true })}
            loading={isLoading}
          />
          <Input
            type="number"
            label="Intervalo antes de comentar (segundos)"
            {...register("commentInterval", { valueAsNumber: true })}
            loading={isLoading}
          />
          <Input
            type="number"
            label="Intervalo após comentar (segundos)"
            {...register("afterCommentInterval", { valueAsNumber: true })}
            loading={isLoading}
          />
          <Input
            type="number"
            label="Intervalo antes de compartilhar (segundos)"
            {...register("shareInterval", { valueAsNumber: true })}
            loading={isLoading}
          />
          <Input
            type="number"
            label="Intervalo após compartilhar (segundos)"
            {...register("afterShareInterval", { valueAsNumber: true })}
            loading={isLoading}
          />
          {/*<Input
            type="number"
            label="Tentativas"
            {...register("retryCount", { valueAsNumber: true })}
            loading={isLoading}
          />*/}
          <Group className="col-span-2 w-full flex-col-reverse border-t border-gray-200 pt-4 dark:border-zinc-800 sm:flex-row">
            <div style={{ flexGrow: 1 }}></div>

            <Button
              type="submit"
              loading={isUpdating || isLoading}
              variant="filled"
              color="primary"
              className="w-full sm:w-[auto]"
            >
              Salvar
            </Button>
          </Group>
        </form>
      </div>
    </div>
  );
}
