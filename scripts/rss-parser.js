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
    
    // Root of xml
    let main = {
      isRoot: true,
      name: "root",
      children: []
    }
  
    // Node to add onto
    let target = main
  
    // Store symbols to go back to parent nodes
    let goBack = {}
    
    // Declare the parser
    let parser = new XMLParser(string)
  
    // Store the new node and switch targets when entering a new tag
    parser.didStartElement = (name, attrs) => {
      let backTo = Symbol()
      goBack[backTo] = target
      let newTarget = {
        name,
        attrs,
        innerText: "",
        children: [],
        end: backTo
      }
      target.children.push(newTarget)
      target = newTarget
    }
  
    // Go back to the parent node when entering a closing tag
    parser.didEndElement = (name) => {
      let sym = target.end
      delete target.end
      target = goBack[sym]
    }
  
    // Add the inner text to the node, if there are multiple text nodes, combine them with spaces
    parser.foundCharacters = (text) => {
      target.innerText +=
        target.innerText === "" ? text.trim() : " " + text.trim()
    }
  
    // Throw error on invalid input
    parser.parseErrorOccurred = () => {
      console.warn(
        "A parse error occurred, ensure the document is formatted properly."
      )
    }
  
    // Parse and return the root
    parser.parse()
  
    // If something went wrong and there is no root node, throw an error
    if (!main.isRoot) {
      console.warn(
        "A parse error occurred, ensure the document is formatted properly."
      )
    }
  
    // Remove the isRoot key
    delete main.isRoot
    
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
     * Notes: you can chose to only use part 1 if you need the attributes or text and tag nodes in the same tag. Replace the `return traverse(main)` below to `return main`
     */
  
    // Return the new simple JSON
    return traverse(main)
  
    // Function to change each node
    function traverse(node) {
      // Store the new node
      let newNode = {}
  
      // Repeat with all children nodes
      for (let child of node.children) {
        // traverse the child
        let newChild = traverse(child)
  
        // If there are no children of the child than it should become a text value
        if (child.children.length === 0) {
          newChild = child.innerText
        }
  
        // If the new node already has a key of the child's name it will become an array
        if (newNode[child.name]) {
          // If it is an array, push the new child
          if (Array.isArray(newNode[child.name])) {
            newNode[child.name].push(newChild)
          } else {
            // If it is not an array, change it into one
            newNode[child.name] = [newNode[child.name], newChild]
          }
        } else {
          // If it is not in the keys, set the child as a value in the new node
          newNode[child.name] = newChild
        }
      }
  
      // Return the new node
      return newNode
    }
  }