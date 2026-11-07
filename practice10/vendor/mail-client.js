// Імітація зовнішньої бібліотеки надсилання пошти (стороннє API, змінювати не можна)
class MailClient {
  constructor({ sender }) {
    this.sender = sender;
    this.outbox = [];
  }

  deliver({ recipients, title, content }) {
    const message = { from: this.sender, recipients, title, content, at: new Date() };
    this.outbox.push(message);
    return message;
  }
}

module.exports = { MailClient };
