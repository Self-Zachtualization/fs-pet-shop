import http from "http";
import fs from "fs";

// To-Do:
// Would be nice to refactor using promises
// Also incorporate helper functions, should be easy
// Add proper Error Handling
// Make notFound() more universally catching; Find the right place for it.

const server = http.createServer((req, res) => {
  const petRegexp = /^\/pets\/(\d*)$/;
  const index = req.url.match(petRegexp);
  const bodyRegexp = /{"age": "(\d+)", "kind": "\S+", "name": "\S+"}/;

  // For GET Requests
  if (req.method === "GET") {
    if (index) {
      fs.readFile("pets.json", "utf-8", (err, data) => {
        let parsed = JSON.parse(data);
        if (parsed[index[1]]) {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(parsed[index[1]]));
        } else {
          notFound(res);
        }
      });
    } else if (req.url === "/pets") {
      fs.readFile("pets.json", "utf-8", (err, data) => {
        res.setHeader("Content-Type", "application/json");
        res.end(data);
      });
    } else {
      notFound(res);
    }
  }

  // For POST requests
  else if ((req.method = "POST")) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      // At this point, `body` is a STRINGIFIED object
      const bodyArray = body.match(bodyRegexp);

      if (bodyArray) {
        // TASK: Read the body
        const newPet = JSON.parse(body);
        const age = parseInt(bodyArray[1]);
        newPet.age = age;

        // TASK: Read the JSON
        fs.readFile("pets.json", "utf-8", (err, data) => {
          const existingPets = JSON.parse(data);
          // TASK: Append new pet to the file
          existingPets.push(newPet);
          // TASK: Return newly created pet and set content-type header
          return fs.writeFile("pets.json", JSON.stringify(existingPets), () => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(newPet));
          });
        });
      } else {
        notFound(res);
      }
    });
  } else {
    notFound(res);
  }
});

function notFound(res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/plain");
  res.end("Not Found");
}

server.listen(3000, () => {
  console.log("server started on port 3000");
});
