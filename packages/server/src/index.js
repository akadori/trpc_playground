"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const trpc_1 = require("./trpc");
const trpcExpress = __importStar(require("@trpc/server/adapters/express"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const users = [
    { id: '1', name: 'John' },
    { id: '2', name: 'Jane' },
    { id: '3', name: 'Jack' },
];
const db = {
    userList: () => users,
    userById: (id) => users.find((user) => user.id === id),
    userCreate: (data) => {
        const user = Object.assign({ id: String(users.length + 1) }, data);
        users.push(user);
        return user;
    },
};
const appRouter = (0, trpc_1.router)({
    userList: trpc_1.publicProcedure
        .query(() => __awaiter(void 0, void 0, void 0, function* () {
        return users;
    })),
    userById: trpc_1.publicProcedure
        // The input is unknown at this time. A client could have sent
        // us anything so we won't assume a certain data type.
        .input((val) => {
        // If the value is of type string, return it.
        // It will now be inferred as a string.
        if (typeof val === 'string')
            return val;
        // Uh oh, looks like that input wasn't a string.
        // We will throw an error instead of running the procedure.
        throw new Error(`Invalid input: ${typeof val}`);
    })
        .query((opts) => __awaiter(void 0, void 0, void 0, function* () {
        const { input } = opts;
        // Retrieve the user with the given ID
        const user = yield db.userById(input);
        return user;
    })),
    // ...
    userCreate: trpc_1.publicProcedure
        .input(
    // The input is unknown at this time. A client could have sent
    // us anything so we won't assume a certain data type.
    (val) => {
        // If the value is an object, return it.
        // It will now be inferred as an object.
        if (typeof val === 'object' && val !== null) {
            if ("name" in val) {
                if (typeof val.name === 'string') {
                    return val;
                }
            }
        }
        // Uh oh, looks like that input wasn't an object.
        // We will throw an error instead of running the procedure.
        throw new Error(`Invalid input: ${typeof val}`);
    })
        .mutation((opts) => __awaiter(void 0, void 0, void 0, function* () {
        const { input } = opts;
        // Create a new user in the database
        const user = yield db.userCreate(input);
        return user;
    })),
});
const createContext = ({ req, res, }) => ({}); // no context
app.use('/trpc', trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
}));
app.listen(4000);
// const server = createHTTPServer({
//     router: appRouter,
//   });
//   server.listen(3000);
//     console.log('Server started on http://localhost:3000');
