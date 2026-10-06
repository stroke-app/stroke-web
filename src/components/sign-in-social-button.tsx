import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { siteButton } from "#/components/page";
import { authClient } from "#/lib/auth/auth-client";
import { cn } from "#/lib/utils";

interface SocialLoginButtonProps {
  provider: string;
  icon: React.ReactNode;
  disabled?: boolean;
  callbackURL: string;
  errorCallbackURL?: string;
}

export function SignInSocialButton(props: SocialLoginButtonProps) {
  const providerLabel =
    props.provider === "github"
      ? "GitHub"
      : props.provider.charAt(0).toUpperCase() + props.provider.slice(1);

  const mutation = useMutation({
    mutationFn: async () =>
      await authClient.signIn.social(
        {
          provider: props.provider,
          callbackURL: props.callbackURL,
          errorCallbackURL: props.errorCallbackURL,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || `An error occurred during ${providerLabel} sign-in.`);
          },
        },
      ),
  });

  // A successful call navigates away to the provider, so the button stays busy until then.
  const busy = mutation.isSuccess || mutation.isPending;

  return (
    <button
      type="button"
      className={cn(siteButton({ variant: "secondary", size: "lg" }), "w-full gap-2.5 text-sm")}
      disabled={busy || props.disabled}
      aria-busy={busy}
      onClick={() => mutation.mutate()}
    >
      {busy ? <Loader2Icon className="size-4 animate-spin" /> : props.icon}
      Continue with {providerLabel}
    </button>
  );
}
