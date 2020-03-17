// mentions could be anything in reality, but 'User' seems like the most likely use case
export class User {
  name = null;
  username = null;
  cssClass = null;
  classMap = {
    1: 'mi-red',
    2: 'mi-green',
    3: 'mi-blue'
  };

  constructor({ name, username, cssClass }) {
    this.name = name;
    this.username = username;
    this.cssClass = cssClass || this.classMap[this.getRandomInt()];
  }

  get firstInitial() {
    return this.username ? this.username[0].toUpperCase() : '';
  }

  getRandomInt(min = 1, max = 3) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
