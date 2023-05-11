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


/** Returns {invoice: {id, amt, paid, add_date, paid_date,
 * company: {code, name, description}}. If id not found,
 * return a 404 status response.
 */
router.get("/:id", async function (req, res) {
  const id = req.params.id;

  const iResult = await db.query(
    `SELECT *
      FROM invoices
      WHERE id = $1`, [id]);
  const invoice = iResult.rows[0];

  if (!invoice) throw new NotFoundError(`No matching company: ${id}`);

  const comp_code = invoice.comp_code

  const cResult = await db.query(
    //TODO: DON'T USE *
    `SELECT *
      FROM companies
      WHERE code = $1`, [comp_code]);
  const company = cResult.rows[0];

  //TODO: can just delete object key
  let desiredInvoiceAttributes = {};
  for (const key in invoice){
    if (key !== "comp_code"){
      desiredInvoiceAttributes[key] = invoice[key]
    }
  }
  return res.json({ invoice: {...desiredInvoiceAttributes, company }});
});


/** Adds an invoice. Needs to be passed in JSON body of: {comp_code, amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post("/", async function (req, res) {
  if (req.body === undefined) throw new BadRequestError();

  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING *`,
    [req.body.comp_code, req.body.amt]);
  const invoice = result.rows[0];

  return res.status(201).json({ invoice });
});


/**Updates an invoice. If invoice cannot be found, returns a 404.
 * Needs to be passed in a JSON body of {amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.put("/:id", async function (req, res) {
  if (req.body === undefined || "code" in req.body) {
    throw new BadRequestError("Not allowed");
  }

  const id = req.params.id;
  const amt = req.body.amt;

  const result = await db.query(
    `UPDATE invoices
      SET amt=$1
      WHERE id = $2
      RETURNING *`,
    [amt, id]);
  const invoice = result.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
  return res.json({ invoice });
});


/** Deletes an invoice. If invoice cannot be found, returns a 404.
 * Returns: {status: "deleted"}
 */
router.delete("/:id", async function (req, res) {
  const id = req.params.id;

  const result = await db.query(
    `DELETE FROM invoices
      WHERE id = $1
      RETURNING id`, [id]);
  const invoice = result.rows[0]

  if (!invoice) throw new NotFoundError(`No matching invoice`);
  return res.json({ status: "deleted" });
});


module.exports = router;