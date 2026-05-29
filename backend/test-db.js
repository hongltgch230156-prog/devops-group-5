const { Pool } = require('pg');

const pool = new Pool({
   user: 'postgres',
   host: 'localhost',
   database: 'tododb',
   password: 'postgres',  // Change this to your actual PostgreSQL password
   port: 5432,
});

pool.query('SELECT * FROM todos', (err, res) => {
   if (err) {
      console.error('Connection failed:', err.message);
   } else {
      console.log('Connected! Todos:', res.rows);
   }
   pool.end();
});