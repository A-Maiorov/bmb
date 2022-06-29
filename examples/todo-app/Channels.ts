import {
  PubSubChannel,
  ReqRepChannel,
} from "browser-message-broker";

export interface ITodo {
  id: number;
  text: string;
  isDone: boolean;
}
export interface ITodoErr {
  message: string;
  context: Partial<ITodo>;
}
export interface IModifyTodo {
  id: number;
  newText: string;
}

export const MESSAGES = {
  ADD_TODO: "addTodo",
  TODO_ADDED: "todoAdded",
  TODO_ERR: "todoErr",
  MODIFY_TODO: "modifyTodo",
  COMPLETE_TODO: "completeTodo",
  TODO_MODIFIED: "todoModified",
  DEL_TODO: "delTodo",
  TODO_DELETED: "todoDeleted",
  GET_ALL_TODOS: "getAllTodos",
  TODO_SELECTED: "todoSelected",
  CHECK_DATA_SOURCE: "checkDataSource",
  DATA_SOURCE_READY: "dataSourceReady",
};

export const todoAddedChannel = PubSubChannel.for<ITodo>(
  MESSAGES.TODO_ADDED,
  {
    broadcast: true,
    cache: false,
  }
);

export const todoErrChannel = PubSubChannel.for<ITodoErr>(
  MESSAGES.TODO_ERR,
  {
    broadcast: true,
    cache: false,
  }
);

export const todoDeletedChannel = PubSubChannel.for<ITodo>(
  MESSAGES.TODO_DELETED,
  {
    broadcast: true,
    cache: false,
  }
);
export const todoModifiedChannel = PubSubChannel.for<ITodo>(
  MESSAGES.TODO_MODIFIED,
  {
    broadcast: true,
    cache: false,
  }
);
export const dsReadyChannel = PubSubChannel.for<boolean>(
  MESSAGES.DATA_SOURCE_READY,
  {
    broadcast: true,
    cache: true,
  }
);

export const addTodoChannel = PubSubChannel.for<
  Partial<ITodo>
>(MESSAGES.ADD_TODO, {
  broadcast: true,
  cache: false,
});

export const completeTodoChannel = PubSubChannel.for<ITodo>(
  MESSAGES.COMPLETE_TODO,
  {
    broadcast: true,
    cache: false,
  }
);

export const delTodoChannel = PubSubChannel.for<ITodo>(
  MESSAGES.DEL_TODO,
  {
    broadcast: true,
    cache: false,
  }
);

export const modifyTodoChannel =
  PubSubChannel.for<IModifyTodo>(MESSAGES.MODIFY_TODO, {
    broadcast: true,
    cache: false,
  });

export const getAllTodosChannel = ReqRepChannel.for<
  undefined,
  ITodo[]
>(MESSAGES.GET_ALL_TODOS, {
  broadcast: true,
});

export const todoSelectedChannel = PubSubChannel.for<ITodo>(
  MESSAGES.TODO_SELECTED,
  {
    broadcast: true,
    cache: true,
  }
);
