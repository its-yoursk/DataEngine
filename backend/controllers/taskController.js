
const { pool } = require("../config/db");

const validId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

const formatTask = (task) => ({
  ...task,
  completed: Boolean(task.completed),
});

const createTask = async (req, res) => {
  try {
    const title = req.body.title?.trim();
    const description = req.body.description || "";

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO tasks (title, description) VALUES (?, ?)",
      [title, description]
    );

    const [rows] = await pool.query(
      `SELECT id, title, description, completed,
              created_at AS createdAt, updated_at AS updatedAt
       FROM tasks WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(formatTask(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, completed,
              created_at AS createdAt, updated_at AS updatedAt
       FROM tasks ORDER BY created_at DESC`
    );

    res.status(200).json(rows.map(formatTask));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const [rows] = await pool.query(
      `SELECT id, title, description, completed,
              created_at AS createdAt, updated_at AS updatedAt
       FROM tasks WHERE id = ?`,
      [Number(req.params.id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(formatTask(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const fields = [];
    const values = [];

    if (req.body.title !== undefined) {
      const title = req.body.title.trim();

      if (!title) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }

      fields.push("title = ?");
      values.push(title);
    }

    if (req.body.description !== undefined) {
      fields.push("description = ?");
      values.push(req.body.description);
    }

    if (req.body.completed !== undefined) {
      fields.push("completed = ?");
      values.push(req.body.completed ? 1 : 0);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const id = Number(req.params.id);

    const [existing] = await pool.query(
      "SELECT id FROM tasks WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    await pool.query(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`,
      [...values, id]
    );

    const [rows] = await pool.query(
      `SELECT id, title, description, completed,
              created_at AS createdAt, updated_at AS updatedAt
       FROM tasks WHERE id = ?`,
      [id]
    );

    res.status(200).json(formatTask(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const [result] = await pool.query(
      "DELETE FROM tasks WHERE id = ?",
      [Number(req.params.id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
