function parseXML(string) {
  /*
   * Part 1
   *
   * Parse the xml into a DOM-like json
   *
   * Input: <tag attribute="value">text node<inline>text node</inline>text node</tag>
   *
   * Output:
   * {
   *   "name": "root",
   *   "children": [
   *     {
   *       "name": "tag",
   *       "attrs": {
   *         "attribute": "value"
   *       },
   *       "innerText": "text node text node",
   *       "children": [
   *         {
   *           "name": "inline",
   *           "attrs": {},
   *           "innerText": "text node",
   *           "children": []
   *         }
   *       ]
   *     }
   *   ]
   * }
   *
   */

  const parser = new XMLParser(string);

  // Root of xml
  const root = {
    name: "root",
    children: [],
  };

  // Store order for closing tags
  const stack = [root];

  // Create the new node and add it to the stack
  parser.didStartElement = (name, attrs) => {
    const node = {
      name,
      attrs,
      innerText: "",
      children: [],
    };

    stack.at(-1).children.push(node);
    stack.push(node);
  };

  // Add the inner text to the node
  parser.foundCharacters = (text) => {
    const node = stack.at(-1);
    node.innerText += node.innerText === "" ? text : " " + text;
  };

  // Remove element from the stack
  parser.didEndElement = () => {
    const removed = stack.pop();

    if (stack.length === 0) {
      throw new Error(`Unexpected closing tag: <${removed.name}/>`);
    }
  };

  // Throw error on invalid input
  parser.parseErrorOccurred = (message) => {
    throw new Error(`A parse error occurred: ${message}`);
  };

  parser.parse();
  if (stack.length !== 1) {
    throw new Error(
      `A parse error occurred, ensure all tags are closed and attributes are properly formatted: <${
        stack.at(-1).name
      }>`
    );
  }

  /*
   * Part 2
   *
   * Manipulate the AST-like json into a simpler json without attributes and other less important items. This will not collect both tag and text nodes if they are in the same tag.
   *
   * Input:
   * {
   *   "name": "root",
   *   "children": [
   *     {
   *       "name": "tag",
   *       "attrs": {
   *         "attribute": "value"
   *       },
   *       "innerText": "text node text node",
   *       "children": [
   *         {
   *           "name": "inline",
   *           "attrs": {},
   *           "innerText": "text node",
   *           "children": []
   *         }
   *       ]
   *     }
   *   ]
   * }
   *
   * Output:
   * {
   *   "tag": {
   *     "inline": "text node"
   *   }
   * }
   *
   * Notes: you can chose to only use part 1 if you need the attributes or text and tag nodes in the same tag. Replace the `return traverse(root)` below to `return root`
   */

  // Return the new simple JSON
  return traverse(root);

  // Function to change each node
  function traverse(node) {
    // Store the new node
    const newNode = {};

    // Repeat with all children nodes
    for (const child of node.children) {
      // traverse the child
      let newChild = traverse(child);

      // If there are no children of the child than it should become a text value
      if (child.children.length === 0) {
        newChild = child.innerText;
      }

      // If the new node already has a key of the child's name it will become an array
      if (newNode[child.name]) {
        // If it is an array, push the new child
        if (Array.isArray(newNode[child.name])) {
          newNode[child.name].push(newChild);
        } else {
          // If it is not an array, change it into one
          newNode[child.name] = [newNode[child.name], newChild];
        }
      } else {
        // If it is not in the keys, set the child as a value in the new node
        newNode[child.name] = newChild;
      }
    }

    // Return the new node
    return newNode;
  }
}
