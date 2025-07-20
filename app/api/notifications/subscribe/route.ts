import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_BD_PASSWORD!
);

export async function POST(req: Request) {
    const subscription = await req.json();
    const { endpoint, keys } = subscription;

    const { data: existing } = await supabase
        .from("push_subscriptions")
        .select("id")
        .eq("endpoint", endpoint)
        .limit(1);

    if (existing && existing.length > 0) {
        return NextResponse.json({ message: "Subscription já existe" });
    }

    const { error } = await supabase.from("push_subscriptions").insert([{ endpoint, keys }]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
