const express = require("express");

// const db = require("./fakeDb");
const router = new express.Router();
let  db  = require("../db");

/**return list of companies */
router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT code, name
         FROM companies`
         );
  return res.json({
    "companies": results.rows
  });
});

/** return single item */
router.get("/:name", async function (req, res) {
  const company = await db.query(
    `SELECT code, name
         FROM companies
         WHERE`
         );
  let returnItem = undefined;

  for (const obj of items) {
    if (obj.name === name) {
      returnItem = obj;
      break;
    }
  }
  return res.json(returnItem);
});

/**add item to array and show added item */
router.post("/", function (req, res) {
  console.log("body is ", req.body);
  let item = {
    "name": req.body.name,
    "price": req.body.price
  };
  items.push(item);

  return res.json({
    "added": item
  });
});


/** modify and show modified item */
router.patch("/:name", function (req, res) {
  let newName = req.body.name;
  let newPrice = req.body.price;
  let currentName = req.params.name;

  for (let obj of items) {
    if (obj.name === currentName) {
      obj.name = newName;
      obj.price = newPrice;
      return res.json({
        "Updated": {...obj}
      });
    }
  }
});

/** deletes item and returns a message of deleted */
router.delete("/:name", function (req, res) {
  let deleteName = req.params.name;
  for (let obj of items) {
    if (obj.name === deleteName) {
      delete obj.name;
      delete obj.price;
      obj = null;
      break;
    }
  }

  return res.json({ "message": "Deleted"});
});


module.exports = router;