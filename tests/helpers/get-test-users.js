const testUsers = [
  {
    "username":"ajball",
    "name":"Andrew Ball"
  },
  {
    "username": "janine",
    "name": "Janine Henry"
  }
];

// mentions could be anything in reality, but 'User' seems like the most probable use case
export class User {
  name = null;
  username = null;
  constructor({ name, username }) {
    this.name = name;
    this.username = username;
  }
}

export default () => testUsers.map( user => new User({ name: user.name, username: user.username }) );
