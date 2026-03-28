"use client";

import NotificationSettingScreen from "@/screens/setting-screen/NotificationSettingScreen";
import { Suspense } from "react";

export default function NotificationSettingsPage() {
    return (
        <Suspense fallback={null}>
            <NotificationSettingScreen />
        </Suspense>
    );
}
