const mysql = require("mysql2/promise");
const { pool } = require("./database");

(async function () {
  try {
    const connectionForDB = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    await connectionForDB.query(`CREATE DATABASE IF NOT EXISTS quiz_app`);
    await connectionForDB.end();
    const connectionForTables = await pool.getConnection();
    await connectionForTables.query("USE quiz_app");
    await connectionForTables.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_text VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await connectionForTables.query(`
      CREATE TABLE IF NOT EXISTS options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        option_text VARCHAR(255) NOT NULL,
        count INT DEFAULT 0,
        question_id INT,
        points INT DEFAULT 0,
        FOREIGN KEY (question_id) REFERENCES questions(id)
      )
    `);
    connectionForTables.release();
  } catch (error) {
    console.error("Erro: ", error);
  } finally {
    process.exit();
  }
})();
