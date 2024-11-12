const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const dbpath1 = path.join(__dirname, "university.db"); 
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
let db = null;
const PORT = process.env.PORT || 3000;

const initialize = async () => {
  try {
    db = await open({
      filename: dbpath1,
      driver: sqlite3.Database,
    });
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.log(`Error message ${e.message}`);
    process.exit(1);
  }
};
initialize();

app.get("/courses", async (request, response) => {
    const query = `SELECT * FROM courses`; 
    const courses = await db.all(query);
    response.send(courses);
});


app.post('/courses', async (req, res) => {
    const { course_name, professor, start_date, end_date } = req.body;
    const courseQuery = `INSERT INTO courses (course_name, professor, start_date, end_date)
                         VALUES (?, ?, ?, ?)`;
    await db.run(courseQuery, [course_name, professor, start_date, end_date]);
    res.status(200).send("Successfully Added Course");
});


app.put('/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { course_name, professor, start_date, end_date } = req.body;
    const courseUpdateQuery = `UPDATE courses SET course_name = ?, professor = ?, start_date = ?, end_date = ? WHERE id = ?`;
    await db.run(courseUpdateQuery, [course_name, professor, start_date, end_date, id]);
    res.status(200).send("Course Updated");
});


app.delete('/courses/:id', async (req, res) => {
    const { id } = req.params;
    const courseDeleteQuery = `DELETE FROM courses WHERE id = ?`;
    await db.run(courseDeleteQuery, [id]);
    res.status(200).send("Successfully Deleted");
});


app.get('/assignments/:course_id', async (req, res) => {
    const { course_id } = req.params;
    if (!course_id) {
        return res.status(400).send({ error: "course_id is required" });
    }

    const query = `SELECT * FROM assignments WHERE course_id = ? ORDER BY due_date`;
    const assignments = await db.all(query, [course_id]);
    res.send(assignments);
});


app.post('/assignments', async (req, res) => {
    const { course_id, title, due_date, status = 'pending' } = req.body;
    const assignmentQuery = `INSERT INTO assignments (course_id, title, due_date, status)
                             VALUES (?, ?, ?, ?)`;
    await db.run(assignmentQuery, [course_id, title, due_date, status]);
    res.status(200).send("Successfully Added Assignment");
});


app.put('/assignments/:id', async (req, res) => {
    const { id } = req.params;
    const { title, due_date, status } = req.body;
    const assignmentUpdateQuery = `UPDATE assignments SET title = ?, due_date = ?, status = ? WHERE id = ?`;
    await db.run(assignmentUpdateQuery, [title, due_date, status, id]);
    res.status(200).send("Assignment Updated");
});

app.delete('/assignments/:id', async (req, res) => {
    const { id } = req.params;
    const assignmentDeleteQuery = `DELETE FROM assignments WHERE id = ?`;
    await db.run(assignmentDeleteQuery, [id]);
    res.status(200).send("Assignment Deleted");
});

