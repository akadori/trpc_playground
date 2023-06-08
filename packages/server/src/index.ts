
import { publicProcedure, router } from './trpc';
import type { inferAsyncReturnType } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express';
const app = express();
type User = { id: string; name: string; };

type Repository = {
userList: () => User[];
userById: (id: string) => User | undefined;
userCreate: (data: { name: string }) => User;
};

const users: User[] = [
    { id: '1', name: 'John' },
    { id: '2', name: 'Jane' },
    { id: '3', name: 'Jack' },
];

const db: Repository = {
    userList: () => users,
    userById: (id) => users.find((user) => user.id === id),
    userCreate: (data) => {
        const user = { id: String(users.length + 1), ...data };
        users.push(user);
        return user;
    },
};
 
const appRouter = router({
  userList: publicProcedure
    .query(async () => {
        return users;
    }),

    userById: publicProcedure
    // The input is unknown at this time. A client could have sent
    // us anything so we won't assume a certain data type.
    .input((val: unknown) => {
      // If the value is of type string, return it.
      // It will now be inferred as a string.
      if (typeof val === 'string') return val;
 
      // Uh oh, looks like that input wasn't a string.
      // We will throw an error instead of running the procedure.
      throw new Error(`Invalid input: ${typeof val}`);
    })
    .query(async (opts) => {
      const { input } = opts;
      // Retrieve the user with the given ID
      const user = await db.userById(input);
      return user;
    }),
        // ...
        userCreate: publicProcedure
          .input(

            // The input is unknown at this time. A client could have sent
            // us anything so we won't assume a certain data type.
            (val: unknown) => {
                // If the value is an object, return it.
                // It will now be inferred as an object.
                if (typeof val === 'object' && val !== null) {
                 if ("name" in val) {
                    if(typeof val.name === 'string') {
                        return val;
                    }
                 }
                }
             
                // Uh oh, looks like that input wasn't an object.
                // We will throw an error instead of running the procedure.
                throw new Error(`Invalid input: ${typeof val}`);
                }

          )
          .mutation(async (opts) => {
            const { input } = opts;
            // Create a new user in the database
            const user = await db.userCreate(input as { name: string });
            return user;
          }),
});
 
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
const createContext = ({
    req,
    res,
  }: trpcExpress.CreateExpressContextOptions) => ({}) // no context
type Context = inferAsyncReturnType<typeof createContext>;
app.use(
'/trpc',
trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
})
);
app.listen(4000);
// const server = createHTTPServer({
//     router: appRouter,
//   });
   
//   server.listen(3000);
//     console.log('Server started on http://localhost:3000');