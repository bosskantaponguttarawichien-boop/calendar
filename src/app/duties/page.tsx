import DutyListScreen from "@/screens/DutyListScreen";
import { Suspense } from "react";

export default function DutiesPage() {
    return (
        <Suspense fallback={null}>
            <DutyListScreen />
        </Suspense>
    );
}
