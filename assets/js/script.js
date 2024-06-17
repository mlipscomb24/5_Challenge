let taskList = JSON.parse(localStorage.getItem("tasks")) || {
  todo: [],
  inProgress: [],
  done: [],
};
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  return `
    <div class="card mb-3" id="task-${task.id}" draggable="true">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  taskList = JSON.parse(localStorage.getItem("tasks")) || {
    todo: [],
    inProgress: [],
    done: [],
  };

  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  taskList.todo.forEach((task) => {
    $("#todo-cards").append(createTaskCard(task));
  });
  taskList.inProgress.forEach((task) => {
    $("#in-progress-cards").append(createTaskCard(task));
  });
  taskList.done.forEach((task) => {
    $("#done-cards").append(createTaskCard(task));
  });

  makeCardsDraggable();
}

function makeCardsDraggable() {
  $('.card[draggable="true"]').draggable({
    revert: "invalid",
    helper: "clone",
    start: function (event, ui) {
      $(ui.helper).addClass("dragging");
    },
    stop: function (event, ui) {
      $(ui.helper).removeClass("dragging");
    },
  });

  $(".lane").droppable({
    accept: '.card[draggable="true"]',
    drop: function (event, ui) {
      handleDrop(event, ui, $(this).attr("id"));
    },
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const title = $("#taskTitle").val();
  const description = $("#taskDescription").val();
  const dueDate = $("#taskDueDate").val();
  const newTask = { id: generateTaskId(), title, description, dueDate };

  taskList.todo.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));

  $("#todo-cards").append(createTaskCard(newTask));
  $("#formModal").modal("hide");
  $("#taskForm")[0].reset();
  makeCardsDraggable();
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest(".card").attr("id").split("-")[1];
  for (const column in taskList) {
    taskList[column] = taskList[column].filter((task) => task.id != taskId);
  }

  localStorage.setItem("tasks", JSON.stringify(taskList));
  $(event.target).closest(".card").remove();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui, newColumnId) {
  const taskId = $(ui.draggable).attr("id").split("-")[1];
  console.log("Task ID:", taskId); // Log the task ID
  console.log("New Column ID:", newColumnId); // Log the new column ID
  let task;

  for (const column in taskList) {
    const index = taskList[column].findIndex((task) => task.id == taskId);
    if (index > -1) {
      task = taskList[column].splice(index, 1)[0];
      console.log("Found Task:", task); // Log the found task
      break;
    }
  }

  switch (newColumnId) {
    case "to-do":
      taskList.todo.push(task);
      console.log("Moved to To Do:", task); // Log task movement
      break;
    case "in-progress":
      taskList.inProgress.push(task);
      console.log("Moved to In Progress:", task); // Log task movement
      break;
    case "done":
      taskList.done.push(task);
      console.log("Moved to Done:", task); // Log task movement
      break;
  }

  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
  console.log("Task List after drop:", taskList); // Log the task list after the drop
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  taskList = JSON.parse(localStorage.getItem("tasks")) || {
    todo: [],
    inProgress: [],
    done: [],
  };
  nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

  renderTaskList();

  $("#taskForm").on("submit", handleAddTask);

  $(document).on("click", ".delete-task", handleDeleteTask);

  makeCardsDraggable();

  $("#taskDueDate").datepicker({ dateFormat: "yy-mm-dd" });
});
