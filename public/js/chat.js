const socket = io();

/* We are going to be selecting the same elements over and over again so instead of writing the same codes over and over again we are goiung to make variables
for all the different elements */

// Elements
const $form = document.querySelector("#textbox");
const $input = $form.querySelector("input");
const $button = $form.querySelector("button");
const $locationButton = document.querySelector("#sendLocation");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#messageTemplate").innerHTML;
const locationTemplate = document.querySelector("#locationTemplate").innerHTML;
const sidebarTemplate = document.querySelector("#sidebarTemplate").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
  /* We are sending things from the server to the client, the problem is that the client is not doing anything to accept it. 
  The return value that comes back from this function needs to be stored in a variable because we are going to be accessing it in this file. 
  So we already have socket in the server side when the new connection comes in, oin teh client side when we initialize the connction we now
  get access to socket that will allow us to send events and perceive events for both; the server and the client.
  */

  const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;
// This line will grab the last element as a child, which will be the new message since new message are added to the bottom
    // We need to know how tall that message is, its standard content including its margin
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    // parseInt takes in a string and it Parses to a number (converts is to an integer)
    // Height of the total new message
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
     
    /* To get the computed style for a given element we use getComputedStyle which is available through the browser we pass the element, 
    so that we can figure out what that spacng margin bottom is */
    
    // Visible Height
    const visibleHeight = $messages.offsetHeight;
    //This is the height of the scrollbar itself

    // Height of Messages Container
    //Total Height we are able to get through
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;
// this will give you scrollBottom since there is no scrollBottom
    if(containerHeight - newMessageHeight <= scrollOffset + 1) {
      $messages.scrollTop = $messages.scrollHeight
    }; 
  };
  /* To do this we will need the height of the new message element, because if the height is lower than the ante-ultimo message then that means that we will 
  autoscroll the message, if its not then we will not autoscroll since that means that the user is looking for a specific data that was mentioned in the past*/
  socket.on("message", (message) => {
    const html = Mustache.render(messageTemplate, {
      username: message.username,
      message: message.text,
      createdAt: moment(message.createdAt).format("llll")
    /* This will get a timestamp for the messages that the user types, letting other people know when it was sent. We get this done by using the
    npm called moment */
    });
    /* ^ This is going to store the final HTML that we will be rendering in the browser, we use the Mustache library to get it. We provide data for our template as our
    second argument to render, we are passing the data into the template
    Mustache is going to copile things correctly and this time we are going to see our dynamic messages showing up*/
    $messages.insertAdjacentHTML("beforeend", html);
    /*beforeend adds messages to the end of the div and afterbegin will add messages to the top inside the div 
    Two step process, the first step is to compile our template with the data that we want to render inside of it. */
    autoscroll();
  });

  socket.on("locationMessage", (message) => {
    const html = Mustache.render(locationTemplate, {
      username: message.username,
      url: message.url,
      createdAt: moment(message.createdAt).format("llll")
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
  });
/* This line of code will listen to the event of sending the location to the other users and having it display on the console, also it proves that the other event handler
is running when we are getting a location that has been shared with us, we can run a seperate code to run, we can render a seperate template including a hyperlink   
When we listen for form submissions we get access to the e event argument. */
socket.on("roomData",({room, users}) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector("#sidebar").innerHTML = html;
});
  $form.addEventListener("submit", (e) => {
    e.preventDefault();
    $button.setAttribute("disabled", "disabled");
    //This line ^ disables the button once it has been submitted. DOM manipulation
    // This is used when we would like to disable the form
    const message = e.target.elements.message.value;
    /* We will grab the message and target that specific input that the user typed in by calling it by the name element */
    socket.emit("sendMessage", message, (error) => {
      $button.removeAttribute("disabled");
      $input.value = "";
      // This line ^ will clear that input once the button submit is pressed
      $input.focus();
      /*This line ^ will put the cursor back to the textbox so that you can write more messages
      This a is when we will re-enable the form */

      if (error) {
        return console.log(error);
      }
      else {
        console.log("Message was delivered succesfully");
      }
    });
  });

  $locationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      return alert("Geolocation is not supportive by your browser");
    }

    $locationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition((position) => {
      socket.emit("sendLocation", {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
       }, () => {
        $locationButton.removeAttribute("disabled");
      });
    })
  });

  socket.emit("join", {username, room}, (error) => {
    if (error) {
      alert(error)
      location.href = "/"
    }
  })
/* This will let the client know what exactly is going on, if there is an error the client will know what to display to let the user know
that there is an error */
/* we will be learning the proper way to use socket.io to
transfer data between the server to the client in real time */

/* we can pass through a function "socket",
this argument, socket is a object and it
contains information about that new connection,
so we can use methods on socket to
communicate with that specific client.
Depending on the number of clients that is being connected
the function will be running that same amount of times */

/* this method will send some information back to the newly connected client,
  that method is Socket.emit */

/* Broadcasting events: two practical features: when a new users joins the chat room all other users will be notified that a new user
has entered the chat room and when a user leaves the chat room they will also be notified that a user has left. When we broadcast an event
that will sent to everybody except the current client. */

/* We will be rendering things in the window as opposed to the terminal to get this done we are going to be using an npm called mustache that will give us everything we
need to define HTML templates and render them with our data from JavaScript, so we will be able to render all sorts of dynamic content to the page. Create a template we
can define a template and render it as many times as needed. To render things that the user writes as a message we would clear the paragraph tag of the HTML page and
replace it with something that mustache, the npm that we are using has built in, with two curly braces and inside of their we reference one of the values that we pass
in. To be able to render a hyperlink for the location we would have to render a seperate template, which means that we will have to create a seperate event that the
server sends to the client so can have seperate logic for that, instead of message we can use locationMessage. */