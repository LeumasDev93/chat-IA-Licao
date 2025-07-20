import { type GetServerSidePropsContext } from "next";
import { createBrowserClient, createServerClient, serializeCookieHeader } from "@supabase/ssr";


export const createSupabaseServerClient = (context: GetServerSidePropsContext | { req: any, res: any }) => {
  const { req, res } = context;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        cookies: {
            getAll() {
             return Object.keys(req.cookies || {}).map((name) => ({ name, value: req.cookies[name] || "" }));
             },
            setAll(cookiesToSet) {
               if (res.setHeader) {
                 res.setHeader(
                  "Set-Cookie",
                    cookiesToSet.map(({ name, value, options}) => serializeCookieHeader(name, value, options)
                    )
                 );
               }
            }     
        }
    }
    
  );

  return supabase;
}

export const createComponentClient = () => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return supabase;
}