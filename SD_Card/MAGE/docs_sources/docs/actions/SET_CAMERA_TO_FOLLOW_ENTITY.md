# SET_CAMERA_TO_FOLLOW_ENTITY

Sets what the camera is following. ([`%PLAYER%`](../relative_references#player) is the default.)

## Example JSON

```json
{
  "action": "SET_CAMERA_TO_FOLLOW_ENTITY",
  "entity": "Entity Name"
}
```

## MGS Natlang

### Example

```mgs
script {
  make camera follow entity "Entity Name";
}
```

### Dictionary entry

```
make camera follow entity $entity:string (;)
```
