import { redirect } from "next/navigation";

/**
 * Root page - Redirects to login
 */
export default function Home() {
    redirect("/login");
}
