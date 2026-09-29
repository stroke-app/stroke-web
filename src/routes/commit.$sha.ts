import { createFileRoute } from "@tanstack/react-router";

import { REPO_URL } from "#/lib/seo";

const SHA = /^[0-9a-f]{7,40}$/i;

/** Short link: stroke.click/commit/<sha> redirects to that commit on GitHub. */
export const Route = createFileRoute("/commit/$sha")({
  server: {
    handlers: {
      GET: ({ params }) => {
        if (!SHA.test(params.sha)) return new Response("Not a commit id", { status: 404 });
        return Response.redirect(`${REPO_URL}/commit/${params.sha.toLowerCase()}`, 302);
      },
    },
  },
});
