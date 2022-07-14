#!/usr/bin/env node
// import fs, { readFile } from "fs";
// The following lets you make use of promises instead of callback functions
// Will need to make use of .then, including commented code for comparison
import { readFile } from "fs/promises";
import { writeFile } from "fs/promises";

const subcommand = process.argv[2];

console.log("subcommand: ", subcommand);

switch (subcommand) {
  // To Create:
  case "create": {
    const inputAge = parseInt(process.argv[3]);
    const inputKind = process.argv[4];
    const inputName = process.argv[5];

    if (inputAge !== inputAge || inputKind === undefined || inputName === undefined) {
      console.error("Error: Usage: node pets.js create AGE KIND NAME");
      break;
    }
    const newPet = { age: inputAge, kind: inputKind, name: inputName };

    readFile("pets.json", "utf-8").then((str) => {
      let data = JSON.parse(str);
      data.push(newPet);

      writeFile("pets.json", JSON.stringify(data)).then(() => {
        console.log("create option, new pet is: ", newPet);
      });
    });
    break;
  }

  // To Read:
  case "read": {
    const itemIndex = process.argv[3];

    readFile("pets.json", "utf-8").then((str) => {
      const data = JSON.parse(str);
      if (itemIndex === undefined) {
        console.error("read option without index passed, data: ", data);
      } else if (data[itemIndex] === undefined) {
        console.error("Error: Index not found. Usage: node pets.js read INDEX");
      } else {
        console.log(`read option with index ${itemIndex}, data:`, data[itemIndex]);
      }
    });
    break;
  }

  // To Update:
  case "update": {
    const inputIndex = process.argv[3];
    const inputAge = parseInt(process.argv[4]);
    const inputKind = process.argv[5];
    const inputName = process.argv[6];
    if (
      inputIndex === undefined ||
      inputKind === undefined ||
      inputName === undefined ||
      inputAge !== inputAge
    ) {
      console.error("Error: Usage: node pets.js update INDEX AGE KIND NAME");
      break;
    }
    const newPet = { age: inputAge, kind: inputKind, name: inputName };

    readFile("pets.json", "utf-8").then((str) => {
      let data = JSON.parse(str);
      data.splice(inputIndex, 1, newPet);

      writeFile("pets.json", JSON.stringify(data)).then(() => {
        console.log("update option, new pet is: ", newPet);
      });
    });
    break;
  }

  // To Destroy:
  case "destroy": {
    const inputIndex = process.argv[3];
    if (inputIndex === undefined) console.error("Error: Usage: node pets.js delete INDEX");

    readFile("pets.json", "utf-8").then((str) => {
      let data = JSON.parse(str);
      let deletion = data.slice(inputIndex, inputIndex + 1);
      data.splice(inputIndex, 1);

      writeFile("pets.json", JSON.stringify(data)).then(() => {
        console.log("delete option, deleted pet is: ", deletion);
      });
    });
    break;
  }

  // Default:
  default: {
    console.error(
      "Running error: Invalid command. Usage: node pets.js [ read [INDEX]| create [AGE KIND NAME] | update [INDEX AGE KIND NAME] | destroy [INDEX] ]"
    );
  }
}

// fs.readFile("./pets.json", "utf-8", (err, str) => {
//   const data = JSON.parse(str);
//   console.log(data);
// });
