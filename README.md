# RFID Inventory App
## [Expo](https://expo.dev) app using TypeScript

### Current status/goal

This app was built for my own home, and the database was structured with that in mind. It has not yet been developed to handle "dynamic databases," and I can't guarantee I will ever open it up to that.

### Recent updates

- edit submit actually submits
- fixed the "see bin" not showing the bin contents until refresh
- transfer container functionality (dropdown in edit item)
- fixed bug: default container in dropdown for edit item is not correct

### Future goals

- build test database for friend's usage
- rename/add/remove containers

- text wrap on bin details (to avoid horizontal scroll)
- ask if possible duplicate (should be stricter fuzzy match than the search)
- search relevance scores
- search looking at description as well as name