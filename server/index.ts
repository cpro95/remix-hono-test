import { Hono } from "hono";
import { cors } from "hono/cors";
import api_todos from "./api/todos";

const app = new Hono<{ Bindings: Env }>();

// CORS
// app.use(
//   "*",
//   cors({
//     origin: "*",
//     allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowHeaders: ["Content-Type", "Authorization"],
//     exposeHeaders: ["Content-Length"],
//     maxAge: 600,
//   })
// );

app.use("*", cors());

// const route = app
//   .get("/api/todos", async (c) => {
//     const todos = await getTodos(c.env.kv);
//     return c.json(todos, {
//       headers: {
//         "Cache-Control": "no-store",
//       },
//     });
//   })
//   .post("/api/todos", zValidator("form", TodoSchema), async (c) => {
//     const validatedData = c.req.valid("form");
//     // console.log(validatedData);
//     await createTodo(c.env.kv, validatedData);
//     return c.json({ ok: true });
//   })
//   .put("/api/todos/:id", zValidator("json", TodoSchema), async (c) => {
//     const id = c.req.param("id");
//     const validatedData = c.req.valid("json");
//     // console.log(validatedData);
//     await updateTodo(c.env.kv, id, { completed: !validatedData.completed });
//     // return c.json({ id: id, completed: !validatedData.completed });
//     return c.json({ ok: true });
//   })
//   .delete("/api/todos/:id", async (c) => {
//     const id = c.req.param("id"); // URL 경로에서 id 가져오기
//     const todo = await getTodo(c.env.kv, id);
//     if (!todo) {
//       return c.json({ message: "not found" }, 404);
//     }
//     await deleteTodo(c.env.kv, id);
//     // return c.redirect("/todos");
//     return c.json({ ok: true });
//   });

// aditional routes
app.get("/hono-test", async (c) => {
  const { kv } = c.env;
  await kv.put("remix-hono", "hono can access cloudflare kv");
  const value = await kv.get("remix-hono");
  console.log(value);
  return c.text(
    `Hono kv is ok, value is ${value} ,\n My_var is ${c.env.API_URL}`
  );
});

const route = app.route("/api", api_todos);

export default app;

export type AppType = typeof route;
