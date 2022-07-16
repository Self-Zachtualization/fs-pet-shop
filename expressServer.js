import express from "express";
import { readFile, writeFile } from "fs";

const app = express();
const PORT = 3000;
const bodyRE = /"age \d+", "kind \S+", "name \S+", /;
app.use(express.json());

// Validation
function validateBody(bodyRE, req) {
  let breakdown = "";
  for (const [key, value] of Object.entries(req.body)) {
    breakdown += `"${key} ${value}", `;
  }
  if (bodyRE.test(breakdown)) {
    return true;
  } else {
    return false;
  }
}

// Task: Return 200
// Task: Content-Type is application/json
// Task: Return all pets as JSON

// This block handles requests with no ID.
app.get("/pets", (req, res, next) => {
  readFile("pets.json", "utf-8", (errISE, data) => {
    if (errISE) {
      console.error("Filesystem error:", errISE);
      next(errISE);
    } else {
      const pets = JSON.parse(data);
      res.send(pets);
    }
  });
});

// This block handles ID'd requests.
app.get(
  "/pets/:id",
  (req, res, next) => {
    readFile("pets.json", "utf-8", (errISE, data) => {
      if (errISE) {
        console.error("Filesystem error:", errISE);
        next(errISE);
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
    res.set("Content-Type", "text/plain");
    res.status(404).send("Not Found");
  }
);

// This block handles POST requests, as long as the
// body is successfully validated.
app.post("/pets", (req, res, next) => {
  readFile("pets.json", "utf-8", (errISE, data) => {
    if (errISE) {
      console.error("Filesystem error:", errISE);
      next(errISE);
    } else {
      if (validateBody(bodyRE, req)) {
        req.body.age = parseInt(req.body.age);
        const pets = JSON.parse(data);
        pets.push(req.body);
        writeFile("pets.json", JSON.stringify(pets), (errISE) => {
          if (errISE) {
            console.error("Filesystem error:", err);
            next(errISE);
          } else {
            res.json(pets);
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

// This block handles all instances of server-fault errors.
app.use((errISE, req, res, next) => {
  if (errISE) {
    res.set("Content-Type", "text/plain").status(500).send(`Internal Server Error`);
  }
});

app.listen(PORT, () => {
  console.log(`ez listenin' on station ${PORT}`);
});

// Error handler
// THIS IS IN PROMISE SYNTAX
// When in get function, use .catch, like

// app.get("url", (req, res) => {
//     const index = req.params.index;
//     readFile("pets.json", "utf-8")
//     .then((str) => {
//         const pets = JSON.parse(str);
//         res.send(pets[index]);
//     })
//     .catch(next);
// })
// app.use((err, req, res, next) => {
//     if(err) {
//         res.status(500);
//     }
// })
