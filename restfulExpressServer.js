import express from "express";
import pg from "pg";
import basicAuth from "express-basic-auth";

const app = express();
const PORT = 3000;

const pool = new pg.Pool({
  database: "petshop",
});

app.use(express.json());
app.use(
  basicAuth({
    users: { admin: "meowmix" },
    unauthorizedResponse: getUnauthorizedResponse,
  })
);

function getUnauthorizedResponse(req) {
  return req.auth
    ? "Credentials " + req.auth.user + ":" + req.auth.password + " rejected"
    : "No credentials provided";
}

function idIsNumber(id) {
  if (Number.isNaN(id)) {
    return false;
  } else {
    return true;
  }
}

// Handling POST requests with DB:
app.post("/pets", (req, res, next) => {
  const { name, kind, age } = req.body;
  if (!name || !kind || !age) {
    res.sendStatus(400);
  } else {
    pool
      .query(
        `INSERT INTO pets (name, kind, age)
            VALUES ($1, $2, $3)
            RETURNING *;`,
        [name, kind, age]
      )
      .then((info) => {
        res.send(info.rows[0]);
      })
      .catch((err) => next(err));
  }
});

// Handling generic GET requests using DB:
app.get("/pets", (req, res) => {
  pool.query("SELECT * FROM pets").then((info) => {
    res.send(info.rows);
  });
});

// Handling ID'd GET requests using DB:
app.get("/pets/:id", (req, res) => {
  const { id } = req.params;
  if (idIsNumber(id)) {
    pool.query(`SELECT * FROM pets WHERE id = $1;`, [id]).then((data) => {
      const pet = data.rows[0];
      if (pet) {
        res.send(pet);
      } else {
        res.sendStatus(404);
      }
    });
  } else {
    res.sendStatus(400);
  }
});

// Handling PATCH requests with DB:
app.patch("/pets/:id", (req, res) => {
  const { id } = req.params;
  if (idIsNumber(id)) {
    const { name, kind, age } = req.body;
    pool
      .query(
        `UPDATE pets
          SET name = COALESCE($1, name),
          kind = COALESCE($2, kind),
          age = COALESCE($3, age)
          WHERE id = $4
          RETURNING *;`,
        [name, kind, age, id]
      )
      .then((info) => {
        if (!info.rows.length) {
          res.sendStatus(404);
        } else {
          res.send(info.rows[0]);
        }
      });
  } else {
    res.sendStatus(400);
  }
});

// Handling DELETE requests with DB:
app.delete("/pets/:id", (req, res, next) => {
  const { id } = req.params;
  if (idIsNumber(id)) {
    pool
      .query(`DELETE FROM pets WHERE id = $1 RETURNING *;`, [id])
      .then((data) => {
        if (!data.rows.length) {
          res.sendStatus(404);
        } else {
          res.send(data.rows[0]);
        }
      })
      .catch(next);
  } else {
    res.sendStatus(400);
  }
});

// Bad URL
app.use((req, res, next) => {
  res.sendStatus(404);
});

// Server error
app.use((err, req, res, next) => {
  if (err) {
    pool.end();
    console.error(`Internal Server Error`, err);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log("Smooth");
});

// import { readFile, writeFile } from "fs";
// const bodyParts = { age: /"age \d+"/, kind: /"kind \S+"/, name: /"name \S+"/ };
// const { age, kind, name } = bodyParts;
// const bodyRE = /{\s*"age":\s*"\d"\s*,\s*"kind":\s*"\S*"\s*,\s*"name":\s*"\S*"\s*}/;

// Validation
// vvv Obsolete due to using DB query vvv

// function validatePost(bodyRE, req) {
//   if (bodyRE.test(JSON.stringify(req.body))) {
//     return true;
//   } else {
//     return false;
//   }
// }

// function validatePatch(req) {
//   const checkedBody = {};
//   for (const [key, value] of Object.entries(req.body)) {
//     let breakdown = `"${key} ${value}"`;
//     if (breakdown.match(age) || breakdown.match(kind) || breakdown.match(name)) {
//       checkedBody[key] = value;
//     }
//   }
//   if (Object.entries(checkedBody).length > 0) {
//     return checkedBody;
//   } else {
//     return false;
//   }
// }
// ^^^ Obsolete due to using DB query ^^^

// This block handles POST requests, as long as the
// body is successfully validated.
// app.post("/pets", (req, res, next) => {
//   readFile("pets.json", "utf-8", (err, data) => {
//     if (err) {
//       next(err);
//     } else {
//       if (validatePost(bodyRE, req)) {
//         req.body.age = parseInt(req.body.age);
//         const pets = JSON.parse(data);
//         pets.push(req.body);
//         writeFile("pets.json", JSON.stringify(pets), (err) => {
//           if (err) {
//             next(err);
//           } else {
//             res.status(201).json(req.body);
//           }
//         });
//       } else {
//         res
//           .type("text")
//           .status(400)
//           .send(`Please format your pet's information as { "age": "AGE", "kind": "KIND", "name": "NAME"`);
//       }
//     }
//   });
// });

// This block handles ID'd GET requests
// app.get(
//   "/pets/:id",
//   (req, res, next) => {
//     readFile("pets.json", "utf-8", (err, data) => {
//       if (err) {
//         next(err);
//       } else {
//         const pets = JSON.parse(data);
//         if (pets[req.params.id] !== undefined) {
//           res.send(pets[req.params.id]);
//         } else {
//           next();
//         }
//       }
//     });
//   },
//   (req, res) => {
//     res.sendStatus(404);
//   }
// );

// This block handles PATCH requests
// app.patch("/pets/:id", (req, res, next) => {
//   readFile("pets.json", "utf-8", (err, data) => {
//     if (err) {
//       next(err);
//     } else {
//       if (validatePatch(req)) {
//         let checkedBody = validatePatch(req);
//         if ("age" in checkedBody) {
//           checkedBody.age = parseInt(checkedBody.age);
//         }
//         let pets = JSON.parse(data);
//         Object.assign(pets[req.params.id], checkedBody);
//         writeFile("pets.json", JSON.stringify(pets), (err) => {
//           if (err) {
//             next(err);
//           } else {
//             res.send(pets[req.params.id]);
//           }
//         });
//       } else {
//         res
//           .type("text")
//           .status(400)
//           .send(`Please format your pet's information as { "age": "AGE", "kind": "KIND", "name": "NAME"`);
//       }
//     }
//   });
// });

// This block deletes.
// app.delete("/pets/:id", (req, res) => {
//   readFile("pets.json", "utf-8", (err, data) => {
//     if (err) {
//       next(err);
//     } else {
//       const pets = JSON.parse(data);
//       const index = req.params.id;
//       const adoptedPet = pets[index];
//       if (adoptedPet) {
//         pets.splice(index, 1);
//         writeFile("pets.json", JSON.stringify(pets), (err) => {
//           if (err) {
//             next(err);
//           } else {
//             res.send(adoptedPet);
//           }
//         });
//       } else {
//         res.sendStatus(404);
//       }
//     }
//   });
// });
