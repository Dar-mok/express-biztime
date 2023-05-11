const request = require("supertest");

const app = require("../app");
const db = require("../db");
// let testItems = [];

let company = {
  "code": "Pickles",
  "name": 5.50,
  "description": "suh bruh"
};

beforeEach(async function () {
});

afterEach(function () {
  items = [];
});

/** GET /items - returns `[{item}, {item}]` */
describe("GET /items", function () {
  it("Gets a list of items", async function () {
    const resp = await request(app).get(`/items`);

    expect(resp.body).toEqual({ "items":[{
      "name": "Pickles",
      "price": 1.50
    }]});
  });
});

/** POST /items - create item from data; return `{"added": {name": "Pickles",
                              "price": 1.50 }}` */

describe("POST /items", function () {
  it("Creates a new item", async function () {
    const resp = await request(app)
      .post(`/items`)
      .send({
        "name": "banana",
        "price": 2.00
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      "added": {
        "name": "banana",
        "price": 2.00
      }
    });
  });
});

/** PATCH /items/[name] - update item; return `{Updated :{name": "Pickles",
                              "price": 1.50 }}` */

describe("PATCH /items/:name", function() {
  it("Updates a single item", async function() {
    const resp = await request(app)
      .patch(`/items/Pickles`)
      .send({
        "name" : "cucumber",
        "price" : 3.00
      });
    expect(resp.body).toEqual({
      "Updated" : { "name" : "cucumber",
      "price" : 3.00}
    });
  });

  // it("Responds with 404 if name invalid", async function() {
  //   const resp = await request(app).patch(`/cats/not-here`);
  //   expect(resp.statusCode).toEqual(404);
  // });
});

/** DELETE /items/[name] - delete item,
 *  return `{ "message": "Deleted" }` */
describe("DELETE /items/:name", function() {
  it("Deletes a single item", async function() {
    let resp = await request(app)
      .delete(`/items/Pickles`);
    expect(resp.body).toEqual({ "message": "Deleted"});
    // expect(items.length).toEqual(0);
  });
});