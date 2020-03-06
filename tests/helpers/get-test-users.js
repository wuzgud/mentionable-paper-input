const testUsers = [
  {
    "username": "ajball",
    "name":"Andrew Ball"
  },
  {
    "username": "janine",
    "name": "Janine Henry"
  }
];

const bigArrayTestUsers = [
  {
    "username": "ajball",
    "name":"Andrew Ball"
  },
  {
    "username": "janine",
    "name": "Janine Henry"
  },
  {
    "username": "will",
    "name":"Will Henry"
  },
  {
    "username": "slauna",
    "name": "Shauna Robertson"
  },
  {
    "username": "wsb",
    "name":"Will Belcher"
  },
  {
    "username": "chuck_city",
    "name": "Charlie Arrendale"
  },
  {
    "username": "carly",
    "name":"Carly Waters"
  },
  {
    "username": "test",
    "name": "Test User"
  }
];

// mentions could be anything in reality, but 'User' seems like the most likely use case
export class User {
  name = null;
  username = null;
  constructor({ name, username }) {
    this.name = name;
    this.username = username;
  }
}

export const getTestUsers =  () => testUsers.map( user => new User({ name: user.name, username: user.username }) );
export const getBigArrayTestUsers =  () => bigArrayTestUsers.map( user => new User({ name: user.name, username: user.username }) );
