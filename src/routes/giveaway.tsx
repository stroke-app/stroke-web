import { createFileRoute, redirect } from "@tanstack/react-router";

/** The weekly giveaway has ended. Old links land on the homepage. */
export const Route = createFileRoute("/giveaway")({
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
