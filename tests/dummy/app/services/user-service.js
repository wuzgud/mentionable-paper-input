import Service from '@ember/service';
import RSVP from 'rsvp';
import { User } from '../models/user';

export default class UserService extends Service {
  users = [
    {
      "username": "ajball",
      "name":"Andrew Ball",
      "cssClass": "mi-blue"
    },
    {
      "username": "janine",
      "name": "Janine Henry",
      "cssClass": "mi-green"
    },
    {
      "username": "will",
      "name":"Will Henry",
      "cssClass": "mi-green"
    },
    {
      "username": "slauna",
      "name": "Shauna Robertson",
      "cssClass": "mi-red"
    },
    {
      "username": "wsb",
      "name":"Will Belcher",
      "cssClass": "mi-blue"
    },
    {
      "username": "chuck_city",
      "name": "Charlie Arrendale",
      "cssClass": "mi-red"
    },
    {
      "username": "carly",
      "name":"Carly Waters",
      "cssClass": "mi-green"
    },
    {
      "username": "test",
      "name": "Test User",
      "cssClass": "mi-red"
    }
  ];
  constructor() {
    super(...arguments);
  }
  findAll(searchTerm) {
    const users = searchTerm ? this.users.map( user => new User(user)) : [];
    return new RSVP.Promise( resolve => resolve(users) );
  }
}
