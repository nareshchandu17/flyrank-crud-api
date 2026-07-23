const initialTasks = [
  {
    id: 1,
    title: "Learn Express",
    done: false
  },
  {
    id: 2,
    title: "Complete FlyRank Assignment",
    done: false
  },
  {
    id: 3,
    title: "Push project to GitHub",
    done: true
  }
];

const tasks = [...initialTasks];

module.exports = {
    tasks,
    initialTasks
};