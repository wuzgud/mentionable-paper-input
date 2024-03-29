// mentions could be anything in reality, but mentioning users is a common use case
export class User {
  name = '';
  username = '';
  cssClass = '';
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
    return this.username === 'me'
      ? this.username.charAt(0).toUpperCase() + this.username.slice(1)
      : this.username[0].toUpperCase();
  }

  getRandomInt(min = 1, max = 3) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
