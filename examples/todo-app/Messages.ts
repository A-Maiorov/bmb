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
