const express = require("express");
const app = express();

const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const sqlite3 = require("sqlite3");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB ERROR : ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1

const hasStatusAndPriority = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};
const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  let getTodosQuery = "";
  let data = null;

  switch (true) {
    case hasStatusAndPriority(request.query):
      getTodosQuery = `select * from todo where 
            todo like '%${search_q}%'
            and status = '${status}'
            and priority = '${priority}'`;
      break;

    case hasStatus(request.query):
      getTodosQuery = `select * from todo where 
            todo like '%${search_q}%'
            and status = '${status}'`;
      break;

    case hasPriority(request.query):
      getTodosQuery = `select * from todo where 
                todo like '%${search_q}%'
                and priority = '${priority}'`;
      break;
    default:
      getTodosQuery = `select * from todo where 
                todo like '%${search_q}%'`;
      break;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoItem = `select * from todo where id = ${todoId}`;
  const dbResponse = await db.get(todoItem);
  response.send(dbResponse);
});

//API 3

app.use(express.json());

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const postQuery = `insert into todo (id,todo,priority,status) values (
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
    )`;
  const dbResponse = await db.run(postQuery);
  response.send("Todo Successfully Added");
});

//API 4

const hasStatus1 = (requestBody) => {
  return requestBody.status !== undefined;
};
const hasPriority1 = (requestBody) => {
  return requestBody.priority !== undefined;
};
const hasTodo = (requestBody) => {
  return requestBody.todo !== undefined;
};

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, status, priority } = request.body;
  let putQuery = "";

  switch (true) {
    case hasStatus1(request.body):
      putQuery = `update todo set status = '${status}' where id = ${todoId}`;
      await db.run(putQuery);
      console.log(putQuery);
      response.send("Status Updated");
      break;

    case hasPriority1(request.body):
      putQuery = `update todo set priority = '${priority}' where id = ${todoId}`;
      await db.run(putQuery);
      response.send("Priority Updated");
      break;

    case hasTodo(request.body):
      putQuery = `update todo set todo = '${todo}' where id = ${todoId}`;
      await db.run(putQuery);
      response.send("Todo Updated");
      break;
  }
});

//API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `delete from todo where id = ${todoId}`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
