import Footer from "@/components/footer";
import { Inter } from "next/font/google";
import useSWR from "swr";

const inter = Inter({ subsets: ["latin"] });

export default function Layout({ children }) {
  return (
    <>
      <main className={inter.className}>{children}</main>
      <Footer />
    </>
  );
}
