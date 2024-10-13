import { z } from "zod";

// Todo 스키마
export const TodoSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1).max(100),
  completed: z.number().default(0),
});

export interface Todo {
  id: number;
  title: string;
  completed: number;
}

export interface CreateTodoType {
  title: string;
}

export interface UpdateTodoType {
  title: string;
  completed: number;
}

export const getTodos = async (DB: D1Database): Promise<Todo[]> => {
  try {
    // SQL 쿼리를 사용해 D1에서 모든 Todo 항목을 가져옴
    const result = await DB.prepare("SELECT * FROM Todos").all<Todo>();
    // console.log("Inside getTodos");
    // console.log(result);

    // result type
    // {
    //   success: true,
    //   meta: {
    //     served_by: 'miniflare.db',
    //     duration: 0,
    //     changes: 0,
    //     last_row_id: 0,
    //     changed_db: false,
    //     size_after: 16384,
    //     rows_read: 1,
    //     rows_written: 0
    //   },
    //   results: [ { id: 9, title: '1111', completed: 0 } ]
    // }

    // 쿼리 결과를 반환
    return result.results || [];
  } catch (error) {
    console.error("Failed to fetch todos from D1 DB", error);
    return [];
  }
};

export const getTodo = async (
  DB: D1Database,
  id: number
): Promise<Todo | null> => {
  try {
    // SQL 쿼리로 특정 id에 해당하는 Todo 항목을 조회
    const todo = await DB.prepare("SELECT * FROM Todos WHERE id = ?")
      .bind(id)
      .first<Todo>();
    // console.log(todo);

    // 결과가 존재하면 해당 Todo 반환, 없으면 null 반환
    return todo || null;
  } catch (error) {
    console.error(`Failed to fetch todo with id ${id} from D1 DB`, error);
    return null;
  }
};

export const createTodo = async (
  DB: D1Database,
  param: CreateTodoType
): Promise<Todo> => {
  try {
    // 새로운 UUID를 생성하여 Todo의 id로 사용
    // id 는 AUTOINCREMENT라서 필요없음.
    // const id = crypto.randomUUID();

    // D1 DB에 새로운 Todo 항목 삽입
    const result = await DB.prepare("INSERT INTO Todos (title) VALUES (?)")
      .bind(param.title)
      .run();
    // console.log(result);

    // 삽입된 행의 ID 가져오기
    // const id = result.meta.last_row_id;
    // {
    //   success: true,
    //   meta: {
    //     served_by: 'miniflare.db',
    //     duration: 0,
    //     changes: 1,
    //     last_row_id: 9,
    //     changed_db: true,
    //     size_after: 16384,
    //     rows_read: 1,
    //     rows_written: 2
    //   },
    //   results: []
    // }

    if (!result.success) {
      throw new Error("Failed to retrieve the ID of the inserted Todo.");
    }

    // 새로 삽입된 Todo 객체 생성
    const newTodo: Todo = {
      id: result.meta.last_row_id,
      title: param.title,
      completed: 0,
    };

    return newTodo;
  } catch (error) {
    console.error("Failed to create todo in D1 DB", error);
    throw new Error("Todo creation failed");
  }
};

export const updateTodo = async (
  DB: D1Database,
  id: number,
  param: UpdateTodoType
): Promise<void> => {
  const todo = await DB.prepare("SELECT * FROM Todos where id = ?")
    .bind(id)
    .first<Todo>();

  if (!todo) {
    console.error(`Todo with id ${id} not found.`);
    return;
  }

  // 업데이트할 항목 정의 (기존 값과 새로운 값 병합)
  const updatedTodo = {
    ...todo,
    ...param,
  };

  // D1 DB에서 해당 id의 Todo 항목 업데이트
  const result = await DB.prepare(
    "UPDATE Todos SET title = ?, completed = ? where id = ?"
  )
    .bind(updatedTodo.title, updatedTodo.completed, id)
    .run();

  // console.log("After update");
  // console.log(result);

  // results type is
  // {
  //   success: true,
  //   meta: {
  //     served_by: 'miniflare.db',
  //     duration: 0,
  //     changes: 1,
  //     last_row_id: 0,
  //     changed_db: true,
  //     size_after: 16384,
  //     rows_read: 1,
  //     rows_written: 1
  //   },
  //   results: []
  // }
};

export const deleteTodo = async (DB: D1Database, id: number) => {
  try {
    const result = await DB.prepare("DELETE FROM Todos Where id = ?")
      .bind(id)
      .run();
    // console.log(`Todo with id ${id} successfully deleted.`);
    // console.log(result);
  } catch (error) {
    console.error("Failed to delete todo in D1 DB", error);
    throw new Error("Todo deletion failed");
  }
};

// DB.prepare를 run() 하면 아래와 같이 객체가 나오고
// first<Todo>() 하면 해당 객체 하나만 나온다.
