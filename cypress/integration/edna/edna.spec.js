import { exportAllDeclaration } from "@babel/types";
import { isContext } from "vm";

describe("The toggle button", function() {
  it("successfully toggles chart", function() {
    cy.visit("/"); // change URL to match your dev URL
    cy.get("#graph-button").click();
    cy.get("#chart").should("have.attr", "style");
    cy.get("#graph-button").click();
    cy.get("#chart").should("have.attr", "style", "display: none;");
  });
});

describe("The plot circles", function() {
  before(() => {
    cy.visit("/");
    cy.get(".leaflet-sidebar-tabs").within(() => {
      cy.get(".active").click();
    });
  });

  it("should enlarge when hovered", function() {
    cy.get("#graph-button").click();
    cy.get(".leaflet-control-layers-overlays input:first").click();
    cy.wait(3000);
    cy.get("#_279:first")
      .should("have.attr", "r", "7")
      .trigger("mouseover", { force: true })
      .should("have.attr", "r", "14");
  });
});

describe("The heat layer", function() {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Should only add itself to map on first data received.", function() {
    cy.get(".leaflet-heatmap-layer");
    cy.get(".leaflet-control-layers-overlays input:last").click({
      force: true
    });
    cy.get("#rarity-checkbox").check();
    cy.get(".leaflet-heatmap-layer").should("not.exist");
  });
});

describe("Colour metric select", function() {
  before(() => {
    cy.visit("/");
    cy.get(".leaflet-sidebar-tabs").within(() => {
      cy.get(".active").click();
    });
    cy.get("#graph-button").click();
  });

  it("should change circle colour on selection change", function() {
    cy.get("#_359:first").should("have.attr", "fill", "rgb(0, 0, 255)");
    cy.get("#meta-select").select("biome_t2");
    cy.get("#_359:first").should("have.not.attr", "fill", "rgb(0, 0, 255)");
  });
});

describe("Colour scheme select", function() {
  before(() => {
    cy.visit("/");
    cy.get(".leaflet-sidebar-tabs").within(() => {
      cy.get(".active").click();
    });
    cy.get("#graph-button").click();
  });

  it("should change colour for certain metrics", function() {
    cy.get("#meta-select").select("elevation");
    cy.get("#_359:first").should("have.attr", "fill", "rgb(0, 0, 255)");
    cy.get("#colour-scheme-select").select("diverging");
    cy.get("#_359:first").should("have.not.attr", "fill", "rgb(0, 0, 255)");
  });

  it("should not alter colour for specified metrics", function() {
    cy.get(".leaflet-control-layers-overlays input:first").click();
    cy.get("#meta-select").select("biome_t2");
    cy.wait(400);
    cy.get("#_359:first").then(circleElem => {
      const firstFill = Cypress.$(circleElem).attr("fill");
      cy.get("#colour-scheme-select").select("diverging");
      cy.wait(400);
      cy.get("#_359:first").should("have.attr", "fill", firstFill);
    });
  });
});

describe("Grid layer + Circle Plot Interaction", function() {
  before(() => {
    cy.visit("/");
    cy.get(".leaflet-control-layers-overlays input:first").click();
    cy.get("#graph-button").click();
    cy.get(".leaflet-sidebar-tabs").within(() => {
      cy.get(".active").click();
    });
  });

  it("should generate popup content when clicked on", function() {
    cy.get(".leaflet-interactive:first").click();
    // cy.wait(200);
    cy.get(".leaflet-popup-content").contains("Cell Richness");
  });

  it("Grid cell hover should expand related plot circles", function() {
    // cy.get(".leaflet-control-layers-overlays input:first").click();
    cy.get("#graph-button").click();
    cy.get(".leaflet-interactive:first").trigger("mouseover", { force: true });
    cy.wait(300);
    cy.get('circle[r="14"]');
  });
});

context("Sidebar", () => {
  before(() => {
    cy.visit("/");
  });

  it("Should be initially expanded", () => {
    cy.get("#sidebar").should("not.have.class", "collapsed");
  });

  it("Should should collapse when clicked from expanded view.", () => {
    cy.get(".leaflet-sidebar-tabs").within(() => {
      cy.get(".active").click();
    });
    cy.get("#sidebar").should("have.class", "collapsed");
  });
});

context("Segmented OTU selects", () => {
  before(() => {
    // cy.visit("/");
    // cy.get('a[data-cy="search-tab"]').click();
  });

  beforeEach(() => {
    cy.visit("/");
    cy.get('a[data-cy="search-tab"]').click();
    // cy.get('a[data-cy="search-tab"]').click();
    // cy.get('.leaflet-sidebar-tabs a[data-cy="search-tab]"').click();
  });

  it("otu segmented selects working", () => {
    // making selections
    cy.get("#select2-kingdomSelect-container").click();
    cy.get(".select2-results__options").contains("Animalia");
    cy.get(
      "#select2-kingdomSelect-results .select2-results__option:first"
    ).click();

    cy.get("#select2-phylumSelect-container").click();
    cy.get(".select2-results__options").contains("Bryozoa");
    cy.get(
      "#select2-phylumSelect-results .select2-results__option:first"
    ).click();

    cy.get("#select2-classSelect-container").click();
    cy.get(".select2-results__options").contains("Palae");
    cy.get(
      "#select2-classSelect-results .select2-results__option:first"
    ).click();

    // confirming the selections are there before clearing
    cy.get('span #select2-kingdomSelect-container[role="textbox"]').should(
      "have.attr",
      "title"
    );
    cy.get('span #select2-phylumSelect-container[role="textbox"]').should(
      "have.attr",
      "title"
    );
    cy.get('span #select2-classSelect-container[role="textbox"]').should(
      "have.attr",
      "title"
    );

    // clearing
    cy.get('button[data-cy="clear-btn"').click();

    // checking the selections are no longer there
    cy.get('span #select2-kingdomSelect-container[role="textbox"]').should(
      "not.have.attr",
      "title"
    );
    cy.get('span #select2-phylumSelect-container[role="textbox"]').should(
      "not.have.attr",
      "title"
    );
    cy.get('span #select2-classSelect-container[role="textbox"]').should(
      "not.have.attr",
      "title"
    );
  });

  it("Should add current taxon selections to combination select when add button pressed.", () => {
    cy.get("#select2-kingdomSelect-container").click();
    cy.get(".select2-results__options").contains("Animalia");
    cy.get(
      "#select2-kingdomSelect-results .select2-results__option:first"
    ).click();

    cy.get("#select2-phylumSelect-container").click();
    cy.get(".select2-results__options").contains("Bryozoa");
    cy.get(
      "#select2-phylumSelect-results .select2-results__option:first"
    ).click();

    cy.get("#select2-classSelect-container").click();
    cy.get(".select2-results__options").contains("Palae");
    cy.get(
      "#select2-classSelect-results .select2-results__option:first"
    ).click();

    cy.get('button[data-cy="add-otu-btn"]').click();

    // store the filled selects text and values then compare to the multi-box

    // should contain what is selected

    // cy.get("#select2-kingdomSelect-container").get(kingomSelect => {
    //   console.log(kingdomSelect);
    // });

    cy.get("#combinationSelectWrapper").contains("k__");
    cy.get("#combinationSelectWrapper").contains("p__");
    cy.get("#combinationSelectWrapper").contains("c__");
  });
});
