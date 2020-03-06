// mentions could be anything in reality, but 'User' seems like the most likely use case
export class User {
  name = null;
  username = null;

  constructor({ name, username }) {
    this.name = name;
    this.username = username;
  }
}
