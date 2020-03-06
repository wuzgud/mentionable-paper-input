import Service from '@ember/service';
import RSVP from 'rsvp';
import { User } from 'tests/dummy/app/models/user';

export default class UserService extends Service {
  users = [
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
  constructor() {
    super(...arguments);
  }
  findAll(searchTerm) {
    return new RSVP.Promise(
      resolve => resolve(
        searchTerm
        ? this.users.map( user => new User({ name: user.name, username: user.username }) )
        : []
      )
    );
  }
}
