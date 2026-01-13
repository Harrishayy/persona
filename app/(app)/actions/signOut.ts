"use server";

import { signOut } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export const handleSignOutAction = async () => {
    await signOut();
};