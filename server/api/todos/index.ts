import { Hono } from "hono";

import { zValidator } from "@hono/zod-validator";
import {
  createTodo,
  deleteTodo,
  getTodo,
  getTodos,
  TodoSchema,
  updateTodo,
} from "./model";

// RPC를 위해서는 new Hono<>().get 형식으로 붙혀서 만들어야 한다.
const api_todos = new Hono<{ Bindings: Env }>()
  .get("/todos", async (c) => {
    const todos = await getTodos(c.env.DB);
    return c.json(todos);
  })
  .post("/todos", zValidator("form", TodoSchema), async (c) => {
    const validatedData = c.req.valid("form");
    // console.log(validatedData);
    await createTodo(c.env.DB, validatedData);
    return c.json({ ok: true });
  })
  .put("/todos/:id", zValidator("json", TodoSchema), async (c) => {
    const id = c.req.param("id");
    const validatedData = c.req.valid("json");
    // console.log(validatedData);

    await updateTodo(c.env.DB, parseInt(id), {
      title: validatedData.title,
      completed: validatedData.completed === 0 ? 1 : 0,
    });

    return c.json({ ok: true });
  })
  .delete("/todos/:id", async (c) => {
    const id = c.req.param("id"); // URL 경로에서 id 가져오기
    const todo = await getTodo(c.env.DB, parseInt(id));
    if (!todo) {
      return c.json({ message: "not found" }, 404);
    }
    await deleteTodo(c.env.DB, parseInt(id));
    // return c.redirect("/todos");
    return c.json({ ok: true });
  });

export default api_todos;
