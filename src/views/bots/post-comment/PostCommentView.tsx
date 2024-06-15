import { useMemo } from "react";
import { NextSeo } from "next-seo";
import Breadcrumbs from "@italodeandra/ui/components/Breadcrumbs/Breadcrumbs";
import { PostCommentForm } from "./PostCommentForm";
import Stack from "@italodeandra/ui/components/Stack/Stack";

export default function PostCommentView({ gql }: { gql?: boolean }) {
  let pages = useMemo(
    () => [
      { title: "Robôs" },
      { title: `Postar comentários / Curtir ${gql ? " (GraphQL)" : ""}` },
    ],
    [gql]
  );

  return (
    <div className="flex flex-1 flex-col pb-2 md:px-2">
      <NextSeo title={pages[1].title} />
      <div className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col">
        <Breadcrumbs pages={pages} className="col-span-2 mb-4" />
        <Stack className="flex-1 gap-3">
          <PostCommentForm gql={gql} />
        </Stack>
      </div>
    </div>
  );
}
