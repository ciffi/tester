import { When, Then, Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I am on ciffi.it home page", function () {
  cy.visit("/");
});

Then("I should see the page title {string}", function (string) {
  cy.title().should("eq", string);
});

Then("a canvas {string} should be displayed", function (string) {
  cy.get("canvas").should("have.attr", "id", string);
});
