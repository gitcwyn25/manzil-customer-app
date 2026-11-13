import { FlaskConical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/state/auth";
import { useDemo } from "@/state/demo-store";
import { useT } from "@/state/preferences";

export function DemoGateDialog() {
  const t = useT();
  const { startDemo } = useAuth();
  const { gateOpen, setGateOpen } = useDemo();
  return (
    <Dialog open={gateOpen} onOpenChange={setGateOpen}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <span className="mb-2 inline-flex size-11 items-center justify-center rounded-2xl bg-signal-soft text-forest">
            <FlaskConical className="size-5" aria-hidden />
          </span>
          <DialogTitle className="text-xl font-extrabold">{t("gate.title")}</DialogTitle>
          <DialogDescription>{t("gate.body")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setGateOpen(false)}>
            {t("gate.later")}
          </Button>
          <Button
            variant="signal"
            onClick={() => {
              setGateOpen(false);
              startDemo();
            }}
          >
            {t("auth.exploreDemo")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
