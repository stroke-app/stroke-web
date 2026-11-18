import { createFileRoute, redirect } from "@tanstack/react-router";

// The weekly giveaway has ended; old links land on pricing.
export const Route = createFileRoute("/giveaway")({
  beforeLoad: () => {
    throw redirect({ to: "/pricing", replace: true });
  },
  component: () => null,
});
