import { expect } from "chai";

import { Builder } from "../src/builder";
import { Template } from "../src/template";

describe("Template", () => {
  const fragmentHtml: string =
      '<div class="divClass bionicBinding">' +
        "<p>Nothing to see here</p>" +
        '<p class="bionicBinding">' +
          "Hello world" +
        "</p>" +
        "<!-- Comment -->" +
      "</div>" +
      "<p>Nothing to see here</p>" +
      '<div class="otherDivClass bionicBinding"></div>';
  let fragment: DocumentFragment;
  let template: Template;
  let host: HTMLElement;
  beforeEach(() => {
    fragment = Builder.parse(fragmentHtml);

    template = new Template(fragment, [], "bionicBinding");
    host = document.createElement("div");
  });

  describe("#instantiateFor", () => {
    it("returns a DocumentFragment", () => {
      expect(template.instantiateFor(host)).to.be.an.instanceOf(
          DocumentFragment);
    });

    it("produces a tree owned by the host's document", () => {
      const domRoot: DocumentFragment = template.instantiateFor(host);
      const hostDocument: Document = host.ownerDocument;
      const visit: (node: Node) => void = (node) => {
        expect(node.ownerDocument).to.equal(hostDocument);
        for (let i: number = 0; i < node.childNodes.length; i += 1) {
          visit(node.childNodes[i]);
        }
      };
      visit(domRoot);
    });

    it("produces a tree that matches the template", () => {
      host.appendChild(template.instantiateFor(host));
      expect(host.innerHTML).to.equal(fragmentHtml);
    });
  });

  describe("extractBoundElements", () => {
    let domRoot: DocumentFragment;
    let div1: Element;
    let div2: Element;
    let p: Element;
    let elements: Array<Element>;
    beforeEach(() => {
      domRoot = template.instantiateFor(host);
      div1 = domRoot.childNodes[0] as Element;
      p = domRoot.childNodes[0].childNodes[1] as Element;
      div2 = domRoot.childNodes[2] as Element;

      elements = template.extractBoundElements(domRoot);
    });

    it("extracts the correct elements in document order", () => {
      expect(elements).to.deep.equal([div1, p, div2]);
    });
    it("removes the binding class names", () => {
      host.appendChild(domRoot);
      expect(host.innerHTML).to.equal(
          '<div class="divClass">' +
            "<p>Nothing to see here</p>" +
            '<p class="">' +
              "Hello world" +
            "</p>" +
            "<!-- Comment -->" +
          "</div>" +
          "<p>Nothing to see here</p>" +
          '<div class="otherDivClass"></div>');
      expect(elements).to.deep.equal([div1, p, div2]);
    });
  });
});
