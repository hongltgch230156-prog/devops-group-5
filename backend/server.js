const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// BUG #1: Wrong default password - doesn't match docker-compose!
const pool = new Pool({
   user: process.env.DB_USER,
   host: process.env.DB_HOST,
   database: process.env.DB_NAME,
   password: process.env.DB_PASSWORD,
   port: process.env.DB_PORT,
   ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false
});

const initSchema = () => pool.query(`
   CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )
`);

app.get('/health', (req, res) => {
   res.json({ status: 'healthy', version: '1.0.0' });
});

// GET todos
app.get('/api/todos', async (req, res) => {
   try {
      await initSchema();
      const result = await pool.query('SELECT * FROM todos ORDER BY id');
      res.json(result.rows);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// BUG #2: Missing validation - will cause test to fail!
// STUDENT TODO: Add validation to reject empty title
app.post('/api/todos', async (req, res) => {
   try {
   await initSchema();
      const { title, completed = false } = req.body;

      // STUDENT FIX: Add validation here!
      // Hint: Check if title is empty or undefined
      // Return 400 status with error message if invalid

       if (!title) {
         return res.status(400).json({error: 'Title is undefined. Please assign a title!'})
       }

       if (title.trim().length === 0) {
         return res.status(400).json({error: 'Title is empty. Please add a title!'})
       }

      const result = await pool.query(
         'INSERT INTO todos(title, completed) VALUES($1, $2) RETURNING *',
         [title, completed]
      );
      res.status(201).json(result.rows[0]);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// BUG #3: Missing DELETE endpoint - but test expects it!
// STUDENT TODO: Implement DELETE /api/todos/:id endpoint

app.delete('/api/todos/:id', async (req, res) => {
   try {
   await initSchema();
      const {id} = req.params;

      const result = await pool.query(
         'DELETE FROM todos WHERE id = $1 RETURNING *',
         [id]
      );
      res.status(200).json(result.rows[0]);
   } catch (err) {
      res.status(500).json({error: err.message});
   }
})

// BUG #4: Missing PUT endpoint for updating todos
// STUDENT TODO: Implement PUT /api/todos/:id endpoint

app.put('/api/todos/:id', async (req, res) => {
   try {
   await initSchema();
      const {id} = req.params;
      const {title, completed} = req.body;

      const result = await pool.query(
         'UPDATE todos SET title=$1, completed=$2 WHERE id=$3 RETURNING *',
         [title, completed, id]
      );
      res.status(200).json(result.rows[0]);
   } catch (err) {
      res.status(500).json({error: err.message});
   }
})


const port = process.env.PORT || 8080;

// BUG #5: Server starts even in test mode, causing port conflicts
// STUDENT FIX: Only start server if NOT in test mode
if (!process.env.JEST_WORKER_ID) { //process.env.JEST_WORKER_ID !== 'test --> !process.env.JEST_WORKER_ID
   app.listen(port, () => {
   console.log(`Backend running on port ${port}`);
   });
}

// BUG #6: App not exported - tests can't import it!
// STUDENT FIX: Export the app module

module.exports = app
module.exports.pool = pool;