import DutyListScreen from "@/screens/duty-list-screen/DutyListScreen";
import { Suspense } from "react";

export default function DutiesPage() {
    return (
        <Suspense fallback={null}>
            <DutyListScreen />
        </Suspense>
    );
}
