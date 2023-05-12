const request = require("supertest");

const app = require("../app");
const db = require("../db");

let company;
let invoice;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM invoices")
  let cResult = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('testco', 'Test Company', 'This is a Test')
    RETURNING code, name, description`);
  company = cResult.rows[0];

  let iResult = await db.query(`
    INSERT INTO invoices (comp_code, amt, paid, paid_date)
    VALUES ('testco', 420.69, FALSE, NULL)
    RETURNING id`);
  invoice = iResult.rows[0]
});


/** GET /companies - returns `{companies: , [company,...]}` */
describe("GET /companies", function () {
  test("Gets a list of companies", async function () {
    const resp = await request(app).get(`/companies`);
    delete company.description;
    expect(resp.body).toEqual({ companies: [company] });
  });
});


/** GET /companies/[code] - return `{company: {company..., invoices: [id...]}}` */

describe("GET /companies/:code", function () {
  test("Gets single company", async function () {
    const resp = await request(app).get(`/companies/${company.code}`);
    company.invoices = [invoice.id]
    expect(resp.body).toEqual({ company });
  });

  test("404 if not found", async function () {
    const resp = await request(app).get(`/companies/0`);
    expect(resp.statusCode).toEqual(404);
  });
});