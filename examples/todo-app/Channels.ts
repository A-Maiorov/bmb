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

export const todoAddedChannel =
  PubSubChannel.getOrCreate<ITodo>(MESSAGES.TODO_ADDED, {
    enableBroadcast: true,
    enableCaching: false,
  });

export const todoErrChannel =
  PubSubChannel.getOrCreate<ITodoErr>(MESSAGES.TODO_ERR, {
    enableBroadcast: true,
    enableCaching: false,
  });

export const todoDeletedChannel =
  PubSubChannel.getOrCreate<ITodo>(MESSAGES.TODO_DELETED, {
    enableBroadcast: true,
    enableCaching: false,
  });
export const todoModifiedChannel =
  PubSubChannel.getOrCreate<ITodo>(MESSAGES.TODO_MODIFIED, {
    enableBroadcast: true,
    enableCaching: false,
  });
export const dsReadyChannel =
  PubSubChannel.getOrCreate<boolean>(
    MESSAGES.DATA_SOURCE_READY,
    {
      enableBroadcast: true,
      enableCaching: true,
    }
  );

export const addTodoChannel = PubSubChannel.getOrCreate<
  Partial<ITodo>
>(MESSAGES.ADD_TODO, {
  enableBroadcast: true,
  enableCaching: false,
});

export const completeTodoChannel =
  PubSubChannel.getOrCreate<ITodo>(MESSAGES.COMPLETE_TODO, {
    enableBroadcast: true,
    enableCaching: false,
  });

export const delTodoChannel =
  PubSubChannel.getOrCreate<ITodo>(MESSAGES.DEL_TODO, {
    enableBroadcast: true,
    enableCaching: false,
  });

export const modifyTodoChannel =
  PubSubChannel.getOrCreate<IModifyTodo>(
    MESSAGES.MODIFY_TODO,
    {
      enableBroadcast: true,
      enableCaching: false,
    }
  );

export const getAllTodosChannel = ReqRepChannel.getOrCreate<
  undefined,
  ITodo[]
>(MESSAGES.GET_ALL_TODOS, {
  enableBroadcast: true,
});

export const todoSelectedChannel =
  PubSubChannel.getOrCreate<ITodo>(MESSAGES.TODO_SELECTED, {
    enableBroadcast: true,
    enableCaching: true,
  });
