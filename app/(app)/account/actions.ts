"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requestAccountDeletion } from "@/application/request-account-deletion";
import { cancelAccountDeletion } from "@/application/cancel-account-deletion";

export async function requestAccountDeletionAction() {
  await requestAccountDeletion();
  revalidatePath("/", "layout");
  redirect("/account");
}

export async function cancelAccountDeletionAction() {
  await cancelAccountDeletion();
  revalidatePath("/", "layout");
  redirect("/account");
}
