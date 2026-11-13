import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { EyeOff, Flag, Link2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { CommunityPost } from "@/domain/types";
import { ME_ID } from "@/domain/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDemo } from "@/state/demo-store";
import { useT } from "@/state/preferences";
import { copyLink } from "@/lib/share";

export function PostMenu({ post, onDeleted }: { post: CommunityPost; onDeleted?: (() => void) | undefined }) {
  const t = useT();
  const navigate = useNavigate();
  const { dispatch } = useDemo();
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isMine = post.authorId === ME_ID && post.isLocal;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t("common.more")}
          className="inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
        >
          <MoreHorizontal className="size-5" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl">
          <DropdownMenuItem
            onSelect={async () => {
              if (await copyLink(`/community/post/${post.id}`)) toast.success(t("common.linkCopied"));
            }}
          >
            <Link2 aria-hidden /> {t("action.copyLink")}
          </DropdownMenuItem>
          {isMine ? (
            <>
              <DropdownMenuItem onSelect={() => navigate({ to: "/create", search: { edit: post.id } })}>
                <Pencil aria-hidden /> {t("action.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDeleteOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 aria-hidden /> {t("action.delete")}
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                onSelect={() => {
                  dispatch({ type: "hide", postId: post.id });
                  toast(t("hidden.toast"), {
                    action: { label: t("hidden.undo"), onClick: () => dispatch({ type: "unhide", postId: post.id }) },
                  });
                }}
              >
                <EyeOff aria-hidden /> {t("action.hide")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setReportOpen(true)}>
                <Flag aria-hidden /> {t("action.report")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={reportOpen} onOpenChange={setReportOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("report.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("report.body")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{t("report.ok")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("post.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("post.deleteBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                dispatch({ type: "deletePost", id: post.id });
                toast(t("post.deleted"));
                onDeleted?.();
              }}
            >
              {t("action.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
