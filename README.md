# react-flatlist

A performant interface for rendering simple, flat lists.

## Installation

```
$ npm install --save react-flatlist
```

## Usage
```javascript
  <FlatList
    data={[{key: 'a'}, {key: 'b'}]}
    renderItem={({item}) => <div>{item.key}</div>}
  />
```javascript

## Props


## data
  type: array

## renderItem
  takes an item from data and renders it into the list

## License
MIT
