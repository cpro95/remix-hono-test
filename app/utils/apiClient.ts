import { hc } from "hono/client";
import { AppType } from "../../server";

export const client =
  import.meta.env.MODE === "production"
    ? hc<AppType>(import.meta.env.VITE_API_URL)
    : hc<AppType>("http://localhost:5173/");

export const clientGetTodos = async () => {
  const data = await client.api.todos.$get();
  return data;
};

export const clientDeleteTodo = async (values: any) => {
  await client.api.todos[":id"].$delete({
    param: {
      id: values.id as string,
    },
  });
};

export const clientCreateTodo = async (values: any) => {
  await client.api.todos.$post({
    form: {
      title: values.title,
    },
  });
};
