const { MailClient } = require("../../vendor/mail-client");

const client = new MailClient({ sender: "library@example.edu.ua" });

/** Надсилає повідомлення читачу через зовнішню бібліотеку пошти */
function notify(reader, subject, text) {
  return client.deliver({ recipients: [reader.email], title: subject, content: text });
}

module.exports = { notify, client };
