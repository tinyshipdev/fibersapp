Fibers - To do.

ROADMAP

- add nodes to a "task list".
- copy/paste nested lists from other applications and have them import correctly
- lock nodes to prevent changing
- key commands for markdown formatting
- template lists
  - i.e meeting notes that create a item for agenda, notes, next steps, etc
  - create them via slash commands
- version control
- shared branches
- encrypt data when saving, i don't want to see other peoples data
- open google doc in modal

---

TODO


---

DOING

---

DONE

- ~~cloud sync (save to database)~~
- ~~fix unable to add child node when zoomed in~~
- ~~if you attempt to delete a collapsed node that has child nodes, expand the node to show why you can't delete it~~
- ~~fix breadcrumb trail text rendering, it currently displays markdown, i want to see it with no formatting~~
- ~~fix zoomed node title not rendering correctly~~
- ~~undo drag and drop operations~~
- ~~undo "delete node"~~
- ~~implement modal slash command and plugin architecture~~
- ~~implement markdown~~
- ~~add links to text in nodes~~
- ~~slash commands to add snippets~~
  - ~~e.g add a date by typing /today~~
- ~~convert to nextjs and implement auth~~
- ~~when i select all text in a node and hit backspace, i want to full delete the node~~
- ~~if you indent a node into a collapsed parent, open the parent so we can see where it went~~
- ~~add a help modal to see the keyboard shortcuts~~
- ~~undo, redo~~
- ~~Select multiple lines for deletion~~
  - ~~need to remove content editable and draggable when not editing or dragging~~
  - ~~move drag ability to the expand/collapse icon only~~
- ~~refactor to use inputs instead of contenteditable~~
- ~~arrows on nodes without children are a little hard to see~~
- ~~breadcrumbs don't show full path~~
- ~~if you press enter on a node with text when the cursor is at index 0, add a new node BEFORE~~
- ~~if a task is empty and you press enter, indent left instead of making a new task~~
- ~~fix bug that deletes nodes if you try to move a node to be a child of its own child~~
- ~~add more drop areas to decide if node should be sibling or child~~
- ~~drag and drop tasks to change order~~
- ~~caret position doesn't get set when you select with mouse, need to fix this~~
- ~~click a task to focus on it~~
  - ~~when selecting a task it will show subtasks, with the selected task as a heading~~
  - ~~show a breadcrumb trail leading to this task in the header~~
- ~~make it more visibly obvious when something is collapsed~~
- ~~refactor graphs to combine into single nodes map~~
- ~~fix movement after deleting a task~~
- ~~refactor moveUp and moveDown to return id of element to move to~~
- ~~when you create a task and try to move the cursor down, it doesn't move~~
- ~~delete tasks~~
- ~~use arrow keys to move around the screen~~
- ~~when you create a task and indent whilst editing, the text is deleted~~
- ~~fix the weird caret position that causes flipped words~~
- ~~expand and collapse items~~
  - ~~add attribute to taskGraph to set whether expanded or collapsed~~
- ~~add key listeners to perform actions:~~
  - ~~indent left~~
  - ~~indent right~~
  - ~~add task~~
- ~~make text editable and reflected in state~~
- ~~save state of app somewhere and reload saved state~~