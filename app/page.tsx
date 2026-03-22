import { Suspense } from "react";
import HomeScreen from "@/screens/HomeScreen";


export default function Home() {
  return (
    <main className="h-[100dvh] overflow-hidden">
      <Suspense fallback={null}>
        <HomeScreen />
      </Suspense>
    </main>
  );
}
