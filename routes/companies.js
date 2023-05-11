/** Routes for companies */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");


const router = new express.Router();
let  db  = require("../db");


//TODO: add ORDER BY in sql queries

/**return list of companies */
router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT code, name
         FROM companies`
         );
  return res.json({
    companies: results.rows
  });
});


/** return single company */
router.get("/:code", async function (req, res) {
  const code = req.params.code;
  const results = await db.query(
    `SELECT code, name
         FROM companies
         WHERE code = $1`, [code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ company });
});


/**add item to array and show added item */
router.post("/", async function (req, res) {
  if (req.body === undefined) throw new BadRequestError();
  const results = await db.query(
    `INSERT INTO companies (code, name, description)
         VALUES ($1, $2, $3)
         RETURNING code, name, description`,
    [req.body.code, req.body.name, req.body.description]);
  const company = results.rows[0];

  return res.status(201).json({ company });
});


/** update and show updated company */
router.put("/:code", async function (req, res) {
  if (req.body === undefined || "code" in req.body) {
    throw new BadRequestError("Not allowed");
  }

  const code = req.params.code;
  const results = await db.query(
    `UPDATE companies
         SET name=$1, description=$2
         WHERE code = $3
         RETURNING code, name, description`,
    [req.body.name, req.body.description, code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ company });
});


/** deletes company and returns a status of deleted */
router.delete("/:code", async function (req, res) {
  const code = req.params.code;
  const result = await db.query(`DELETE FROM companies
                                  WHERE code = $1 RETURNING code`, [code]);
  const company = result.rows[0]

  if (!company) throw new NotFoundError(`No matching company: ${company}`);
  return res.json({ status: "deleted" });
});


module.exports = router;