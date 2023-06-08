import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../server/src/index";

const client = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: "http://localhost:4000/trpc",
        }),
    ]
});

client.userById.query("1").then((user) => {
    console.log(user);
});