import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { userId, messages } = await req.json();

    if (!userId || !messages) {
        return NextResponse.json({ error: "Missing userId or messages" }, { status: 400 });
    }

    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!channelAccessToken) {
        console.error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    try {
        const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${channelAccessToken}`,
            },
            body: JSON.stringify({
                to: userId,
                messages: messages,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("LINE API error:", errorData);
            return NextResponse.json({ error: "Failed to send push message", details: errorData }, { status: response.status });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Push message request failed:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
