import express from "express";
import { readFile, writeFile } from "fs";

const app = express();
const PORT = 3000;
const bodyParts = { age: /"age \d+"/, kind: /"kind \S+"/, name: /"name \S+"/ };
const { age, kind, name } = bodyParts;
const bodyRE = /{\s*"age":\s*"\d"\s*,\s*"kind":\s*"\S*"\s*,\s*"name":\s*"\S*"\s*}/;

app.use(express.json());

// Validation
function validatePost(bodyRE, req) {
  if (bodyRE.test(JSON.stringify(req.body))) {
    return true;
  } else {
    return false;
  }
}

function validatePatch(req) {
  const checkedBody = {};
  for (const [key, value] of Object.entries(req.body)) {
    let breakdown = `"${key} ${value}"`;
    if (breakdown.match(age) || breakdown.match(kind) || breakdown.match(name)) {
      checkedBody[key] = value;
    }
  }
  if (Object.entries(checkedBody).length > 0) {
    return checkedBody;
  } else {
    return false;
  }
}

// This block handles POST requests, as long as the
// body is successfully validated.
app.post("/pets", (req, res, next) => {
  readFile("pets.json", "utf-8", (err, data) => {
    if (err) {
      next(err);
    } else {
      if (validatePost(bodyRE, req)) {
        req.body.age = parseInt(req.body.age);
        const pets = JSON.parse(data);
        pets.push(req.body);
        writeFile("pets.json", JSON.stringify(pets), (err) => {
          if (err) {
            next(err);
          } else {
            res.status(201).json(req.body);
          }
        });
      } else {
        res
          .set("Content-Type", "text/plain")
          .status(400)
          .send(`Please format your pet's information as { "age": "AGE", "kind": "KIND", "name": "NAME"`);
      }
    }
  });
});

// This block handles ID'd GET requests
app.get(
  "/pets/:id",
  (req, res, next) => {
    readFile("pets.json", "utf-8", (err, data) => {
      if (err) {
        next(err);
      } else {
        const pets = JSON.parse(data);
        if (pets[req.params.id] !== undefined) {
          res.send(pets[req.params.id]);
        } else {
          next();
        }
      }
    });
  },
  (req, res) => {
    res.type("text");
    res.status(404).send("Not Found");
  }
);

// This block handles PATCH requests
app.patch("/pets/:id", (req, res, next) => {
  readFile("pets.json", "utf-8", (err, data) => {
    if (err) {
      next(err);
    } else {
      if (validatePatch(req)) {
        let checkedBody = validatePatch(req);
        if ("age" in checkedBody) {
          checkedBody.age = parseInt(checkedBody.age);
        }
        let pets = JSON.parse(data);
        Object.assign(pets[req.params.id], checkedBody);
        writeFile("pets.json", JSON.stringify(pets), (err) => {
          if (err) {
            next(err);
          } else {
            res.send(pets[req.params.id]);
          }
        });
      } else {
        res
          .type("text")
          .status(400)
          .send(`Please format your pet's information as { "age": "AGE", "kind": "KIND", "name": "NAME"`);
      }
    }
  });
});

// This block deletes.
app.delete("/pets/:id", (req, res) => {
  readFile("pets.json", "utf-8", (err, data) => {
    if (err) {
      next(err);
    } else {
      const pets = JSON.parse(data);
      const index = req.params.id;
      const adoptedPet = pets[index];
      if (adoptedPet) {
        pets.splice(index, 1);
        writeFile("pets.json", JSON.stringify(pets), (err) => {
          if (err) {
            next(err);
          } else {
            res.send(adoptedPet);
          }
        });
      } else {
        res.type("text").status(404).send("Not Found");
      }
    }
  });
});

app.use((err, req, res, next) => {
  if (err) {
    console.error(`Internal Server Error`, err);
    res.type("text").status(500).send(`Internal Server Error`);
  }
});

app.listen(PORT, () => {
  console.log("Smooth");
});

//Examples from workshop:
// Creating a new product
// let id = 1;
// const createEntity = (data) => {
//   return { id: id++, ...data };
// };

// app.post("/products", (req, res) => {
//   const newProduct = createEntity(req.body);
//   res.json(newProduct);
// })

// // Update a product
// app.patch("/products/:id", (req, res) => {
//   const { id } = req.params;
// })

// // Delete a product
// app.delete('/delete/:id');
