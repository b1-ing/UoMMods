"use client";

import { useRef, useState } from "react";
import mixpanel from "mixpanel-browser";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DialogClose,
  DialogPortal,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { usePathname } from "next/dist/client/components/navigation";

const EXCLUDED_PATHS = ["/privacy", "/login", "/logout"];
const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

export default function CookieConsent() {
  const [consent, setConsent] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("mpConsent") === "true";
  });

  const [modalOpen, setModalOpen] = useState<boolean>(true);
  const initializedRef = useRef(false);

  if (!token) {
    console.warn("MP token unset");
    return null;
  }
  const acceptTracking = () => {
    localStorage.setItem("mpConsent", "true");
    setConsent(true);
    mixpanel.init(token, {
      debug: process.env.ENVIRONMENT == "dev",
      autocapture: true,
      ignore_dnt: true,
    });
    mixpanel.track("Consent Accepted");
  };

  const declineTracking = () => {
    localStorage.setItem("mpConsent", "false");
    setConsent(false);
  };

  // Initialize Mixpanel if consent already given (e.g. on page reload)
  if (consent && !initializedRef.current) {
    mixpanel.init(token, {
      debug: process.env.ENVIRONMENT == "dev",
      autocapture: true,
      ignore_dnt: true,
    });
  }
  const pathname = usePathname();
  const excludedPage = EXCLUDED_PATHS.some((p) => pathname?.startsWith(p));

  if (consent || excludedPage) {
    return null; // Hide consent modal
  }

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogOverlay />
      <DialogPortal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>We use cookies and tracking technologies</DialogTitle>
            <p>
              to provide basic functionaluty and monitor site performance to
              improve your experience. This includes collecting anonymous data
              on page visits and errors. You can choose to Accept or Decline
              tracking. If you decline, we will not track your usage, but you
              can still use the site as normal. Read the full privacy policy{" "}
              <a href="/privacy" className="underline text-blue-500">
                here
              </a>
            </p>
          </DialogHeader>
          <div className="flex justify-center gap-12 mt-4">
            <DialogClose>
              <Button onClick={acceptTracking}>Accept</Button>
            </DialogClose>
            <DialogClose>
              <Button variant="secondary" onClick={declineTracking}>
                Decline
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
