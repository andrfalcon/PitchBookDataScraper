#!/usr/bin/env node

const cheerio = require('cheerio');
const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');
const program = require('commander');

program.version('0.1.0').parse(process.argv);

var inputFiles = [];

fs.readdirSync("inputs").forEach(file => {
  inputFiles.push("inputs/" + file);
  console.log(file);
});

// const inputFiles = program.args.slice(0, program.args.length - 1);
// console.log(inputFiles);
const outputFile = "outputs/" + program.args[program.args.length - 1];
console.log(outputFile);

let Persons = [];
let $ = null;

function GetName(text) {
  const titleAndFullName = text.split(' ').slice(0,3)
  let name = {
    title: titleAndFullName[0],
    firstName: titleAndFullName[1],
    lastName: titleAndFullName[2]
  }
  return name
  // return text.split(' ').slice(0,3).join(' ');
}

function ScrapePerson(row) {
  let company = $(`#search-results-data-table-row-${row}-cell-3`)
    .first()
    .text();
  let position = $(`#search-results-data-table-row-${row}-cell-4`)
    .first()
    .text();
  var name = $(`#search-results-data-table-row-${row}-cell-7`)
    .first()
    .text();
  var title = GetName(name).title;
  var firstName = GetName(name).firstName
  var lastName = GetName(name).lastName
  let email = $(`#search-results-data-table-row-${row}-cell-10`)
    .first()
    .text();
  
  let person = {
    title,
    firstName,
    lastName,
    email,
    position,
    company
  };
  console.log(person);
  return person;
}

inputFiles.forEach(inputFile => {
  const file = fs.readFileSync(__dirname + '/' + inputFile).toString();
  $ = cheerio.load(file);
  for (let i = 0; i < 300; i++) {
    let person = ScrapePerson(i);
    if (person == null) break;
    Persons.push(person);
  }
  Persons = Persons.filter(person => !!person.email.trim());
});

let csv = new ObjectsToCsv(Persons);

csv.toDisk(outputFile);
