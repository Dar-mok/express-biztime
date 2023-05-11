/** Routes for invoices */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");


const router = new express.Router();
let  db  = require("../db");


/** Return info on invoices: like {invoices: [{id, comp_code}, ...]}*/
router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
         FROM invoices
         ORDER BY id`
         );
  return res.json({
    invoices: results.rows
  });
});


/** Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}} return a 404 status response.
 */
router.get("/:id", async function (req, res) {
  const id = req.params.id;
  const Iresults = await db.query(
    `SELECT *
         FROM invoices
         WHERE id = $1`, [id]);
  const invoice = Iresults.rows[0];
  const comp_code = invoice.comp_code

  const Cresult = await db.query(
    `SELECT *
         FROM companies
         WHERE code = $1`, [comp_code]);
  const company = Cresult.rows[0];

  let actualInvoice = {};
  for (const key in invoice){
    if (key !== "comp_code"){
      actualInvoice[key] = invoice[key]
    }
  }

  if (!invoice) throw new NotFoundError(`No matching company: ${id}`);
  return res.json({ invoices: {...actualInvoice, company: {...company}}});
});


/** Adds a company. Needs to be given JSON like: {code, name, description}.
 * Returns obj of new company: {company: {code, name, description}}
 */
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


/**Edit existing company. Should return 404 if company cannot be found.
 * Needs to be given JSON like: {name, description}
 * Returns update company object: {company: {code, name, description}}
 */
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


/** Deletes company. Should return 404 if company cannot be found.
 * Returns {status: "deleted"}
 */
router.delete("/:code", async function (req, res) {
  const code = req.params.code;
  const result = await db.query(
    `DELETE FROM companies
      WHERE code = $1
      RETURNING code`, [code]);
  const company = result.rows[0]

  if (!company) throw new NotFoundError(`No matching company: ${company}`);
  return res.json({ status: "deleted" });
});


module.exports = router;