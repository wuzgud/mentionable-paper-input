import Service from '@ember/service';
import RSVP from 'rsvp';
import { getBigArrayTestUsers } from '../../../helpers/get-test-users';

export default class UserService extends Service {
  constructor() {
    super(...arguments);
  }
  findAll(searchTerm) {
    return new RSVP.Promise(
      resolve => resolve( searchTerm ? getBigArrayTestUsers() : [] )
    );
  }
}
