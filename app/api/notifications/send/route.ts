import { NextResponse } from "next/server";
import webPush from "@/lib/webpush";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_BD_PASSWORD!
);

export async function POST(req: Request) {
    const { title, body } = await req.json();

    const { data: subscriptions, error } = await supabase.from("push_subscriptions").select("*");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const payload = JSON.stringify({ title, body });

    await Promise.all(
        subscriptions.map((sub) =>
            webPush.sendNotification(sub, payload).catch(console.error)
        )
    );

    return NextResponse.json({ success: true });
}
