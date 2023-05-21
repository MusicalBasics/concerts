import ResponsiveAppBar from "@/components/ResponsiveAppBar";
import Map from "../components/Map";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <ResponsiveAppBar />
      <Map />
    </main>
  );
}
