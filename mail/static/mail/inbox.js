document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // When form is submitted
  document.querySelector("#compose-form").addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#content-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#content-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Mailbox
  let mailbox_route = `/emails/${mailbox}`;

  fetch(mailbox_route)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      const emailz = emails;

      // ... do something else with emails ...
      // Loop through the emails array
      for (const email of emailz) {

        const div = document.createElement("div");

        if (email["read"] === true) {
          div.style.backgroundColor = "gray";
        }

        div.addEventListener('click', () => {
          open_email(email["id"], mailbox);
        });
        div.setAttribute("id", "email");

        

        div.innerHTML = `
                        <table>
                          <tr>
                            <td><b>${email["sender"]}</b></td>
                            <td>${email["subject"]}</td>
                            <td>${email["timestamp"]}</td>
                          </tr>
                        </table>
                        `;

        document.querySelector("#emails-view").append(div);

        
      }

  });
}

// Send Mail
function send_email(event) {
  // https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  console.log(recipients);
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
        console.log(result);
        // Print result
        load_mailbox('sent');
    })

  return false;
}

// View Email
function open_email(id, mailbox) {

  // Show the email content and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#content-view').style.display = 'block';
  
  email_route = `/emails/${id}`;

  fetch(email_route, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

  fetch(email_route)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // ... do something else with email ...
      const content = document.querySelector("#content-view");

      content.innerHTML = `<p><b>From: </b>${email["sender"]}</p>
                          <p><b>To: </b>${email["recipients"]}</p>
                          <p><b>Subject: </b>${email["subject"]}</p>
                          <p><b>Timestamp: </b>${email["timestamp"]}</p>
                          <hr>
                          <p>${email["body"]}</p>`;

      // Reply
      const reply_btn = document.createElement("button");
      reply_btn.innerHTML = "Reply";
      reply_btn.addEventListener('click', () => {

        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'block';
        document.querySelector('#content-view').style.display = 'none';

        const recipients = document.querySelector("#compose-recipients");
        const subject = document.querySelector("#compose-subject");
        const body = document.querySelector("#compose-body");

        recipients.value = email["sender"];

        if (email["subject"].startsWith("Re: ")) {
          subject.value = email["subject"];
        }
        else {
          subject.value = `Re: ${email["subject"]}`;
        }

        body.value = `On ${email["timestamp"]} ${email["sender"]} wrote: \n${email["body"]}`;
      });

      content.append(reply_btn);
      
      // Archive and Unarchive
      if (mailbox === 'inbox') {
        const archive_btn = document.createElement("button");
        archive_btn.innerHTML = "Archive";
        archive_btn.addEventListener('click', () => {
          fetch(email_route, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
          })

          load_mailbox('inbox');

          // reload to have the updated JSON data
          location.reload();
        });
        
        content.append(archive_btn);
      }
      else if (mailbox === 'archive') {
        const archive_btn = document.createElement("button");
        archive_btn.innerHTML = "Unarchive";
        archive_btn.addEventListener('click', () => {
          fetch(email_route, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
          })

          load_mailbox('inbox');

          // reload to have the updated JSON data
          location.reload();
        });
        
        content.append(archive_btn);
      }
  });
}