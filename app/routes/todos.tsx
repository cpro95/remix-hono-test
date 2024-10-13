import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
// import { Badge } from "~/components/ui/badge";
import { PlusCircle } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import {
  client,
  clientCreateTodo,
  clientDeleteTodo,
  clientGetTodos,
} from "~/utils/apiClient";
import { Todo } from "server/api/todos/model";

export const meta: MetaFunction = () => {
  return [{ title: "Todo My App" }];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const res = await clientGetTodos();
  return res;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  if (_action === "delete") {
    await clientDeleteTodo(values);
  }

  if (_action === "create") {
    await clientCreateTodo(values);
  }

  return null;
};

// Todo Card
const TodoItem = ({ todo }: { todo: Todo }) => {
  const deleteFetcher = useFetcher();

  const [isCompleted, setIsCompleted] = useState(todo.completed);

  const isDeleting =
    deleteFetcher.state === "submitting" &&
    deleteFetcher.formData?.get("id") === todo.id.toString();

  const handleCheckboxChange = async (checked: boolean) => {
    await client.api.todos[":id"].$put({
      json: {
        title: todo.title,
        completed: isCompleted,
      },
      param: {
        id: todo.id.toString(),
      },
    });

    setIsCompleted(isCompleted === 0 ? 1 : 0);
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow duration-200">
      <CardContent
        className={`${isDeleting ? "bg-gray-300" : ""} flex items-center p-4`}
      >
        <Checkbox
          id={`todo-${todo.id}`}
          checked={isCompleted === 0 ? false : true}
          onCheckedChange={handleCheckboxChange}
          className="mr-4"
        />
        <div className="flex-grow">
          <label
            htmlFor={`todo-${todo.id}`}
            className={`${
              isDeleting ? "opacity-50" : "opacity-100"
            } text-lg font-medium leading-none ${
              isCompleted ? "line-through text-gray-400" : "text-gray-700"
            }`}
          >
            {todo.title}
          </label>
        </div>
        <div>
          <deleteFetcher.Form method="post">
            <input type="hidden" name="id" value={todo.id} />
            <Button
              type="submit"
              name="_action"
              value="delete"
              disabled={isDeleting}
            >
              {isDeleting ? "지우는 중" : "지우기"}
            </Button>
          </deleteFetcher.Form>
        </div>
      </CardContent>
    </Card>
  );
};

const Todos = () => {
  const todos = useLoaderData<typeof loader>();

  const navigation = useNavigation();

  const isAdding =
    navigation.state === "submitting" &&
    navigation.formData?.get("_action") === "create";

  let formRef = useRef<HTMLFormElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    formRef.current?.reset();
    inputRef.current?.focus();
  }, [isAdding]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white text-gray-800 p-4 shadow-sm">
        <div className="container mx-auto">
          <a href="/todos" className="text-2xl font-bold">
            My TODO App
          </a>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4">
        <div className="w-full max-w-4xl mx-auto">
          <Form ref={formRef} replace method="POST">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-700">TODO 리스트</h2>
              <div className="flex space-x-3">
                <Input
                  type="text"
                  name="title"
                  placeholder="title"
                  required
                  ref={inputRef}
                />
                <Button
                  type="submit"
                  name="_action"
                  value="create"
                  disabled={isAdding}
                  className="bg-black text-white hover:bg-gray-800 transition-colors duration-200 rounded-xl px-4 py-2"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {isAdding ? "추가 중" : "TODO 추가하기"}
                </Button>
              </div>
            </div>
          </Form>
          <div className="space-y-4">
            {Array.isArray(todos) &&
              todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)}
          </div>
        </div>
      </main>
    </div>
  );
};
export default Todos;
