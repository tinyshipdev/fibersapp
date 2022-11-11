// Example

szseurlJE8XADJzIDy876gLRREM2 = adamgrayscale@gmail.com (owner)
pzWACynhpvYAJ6cuIiJIUbmxWKV2 = adam.g@miro.com (collaborator)

1. owner invites collaborator to board id 1234 with permissions ["view", "edit", "delete"];

this creates a document in `shared-access` under the owner Id

ownerId:
- collaborators (map)
  - collaboratorId (array)
    - view
    - edit
    - delete

2. the collaborator receives an invite via email (or whatever), containing the boardId, and the ownerId.

the collaborator creates a document in `shared-nodes` with a mapping between the boardId and ownerId for easy lookup

collaboratorId
- boardId = ownerId