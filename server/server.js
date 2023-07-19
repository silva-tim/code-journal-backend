/* eslint-disable no-unused-vars -- Remove me */
import 'dotenv/config';
import pg from 'pg';
import express from 'express';
import errorMiddleware from './lib/error-middleware';
import ClientError from './lib/client-error';

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
app.use(express.json());

app.get('/api/journals', async (req, res, next) => {
  try {
    const sql = `
    select *
     from "entries"
     `;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/journals', async (req, res, next) => {
  try {
    const { title, notes, photoUrl } = req.body;
    validateTitle(title);
    validateNotes(notes);
    validatePhotoUrl(photoUrl);
    const sql = `
    insert into "entries" ("title", "notes", "photoUrl")
      values ($1, $2, $3)
      returning *
      `;
    const params = [title, notes, photoUrl];
    const result = await db.query(sql, params);
    const [journal] = result.rows;
    res.status(201).json(journal);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/journals/:entryId', async (req, res, next) => {
  try {
    const entryId = Number(req.params.entryId);
    validateEntryId(entryId);
    const sql = `
      delete from "entries"
        where "entryId" = $1
        returning *
        `;
    const params = [entryId];
    const result = await db.query(sql, params);
    const [journal] = result.rows;
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

app.put('/api/journals/:entryId', async (req, res, next) => {
  try {
    const entryId = Number(req.params.entryId);
    const { title, notes, photoUrl } = req.body;
    validateTitle(title);
    validateNotes(notes);
    validatePhotoUrl(photoUrl);
    validateEntryId(entryId);
    const sql = `
      update "entries"
        set "title" = $1,
            "notes" = $2,
            "photoUrl" = $3
        where "entryId" = $4
        returning *
        `;
    const params = [title, notes, photoUrl, entryId];
    const result = await db.query(sql, params);
    const [journal] = result.rows;
    res.status(200).json(journal);
  } catch (err) {
    next(err);
  }
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});

function validateEntryId(entryId) {
  if (!Number.isInteger(entryId) || entryId <= 0) {
    throw new ClientError(400, `"entryId" must be a positive integer`);
  }
}

function validateJournal(journal, entryId) {
  if (!journal) {
    throw new ClientError(404, `Cannot find journal "entryId" ${entryId}`);
  }
}

function validateTitle(title) {
  if (!title) {
    throw new ClientError(400, `"title" is required`);
  }
}

function validateNotes(notes) {
  if (!notes) {
    throw new ClientError(400, `"notes" is required`);
  }
}

function validatePhotoUrl(photoUrl) {
  if (!photoUrl) {
    throw new ClientError(400, `"photoUrl" is required`);
  }
}
