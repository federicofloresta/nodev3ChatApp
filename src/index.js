const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {generateMessage, generateLocationMessage} = require("./utils/messages");
const {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
/* All we had to do was to create a new socketIO instance
passing the server in, we can do a lot of things with socketIO
in the server
*/
const port = process.env.PORT || 3000
//Define path for Express configuration
const publicDirectoryPath = path.join(__dirname, "../public")
//use Express middleware to serve public content
app.use(express.static(publicDirectoryPath));


//Prints a new message when a new user connects
io.on("connection", (socket) => {
    console.log("New WebSocket connection");
    /* this is GREAT, we are able to have our client to connect to 
the server and have the server connect to the client. Facilitate
real time communication. We did this by using socketIO
*/
    /* We only run io.on when a user gets connected to the chat, when we want a user to be disconnected
    we would use socket.on */
    socket.on("join",({username, room}, callback)=> {
        const {error, user} = addUser({ id: socket.id, room, username })
// socket.id is the unique identifier for that particular connection 
        if (error) {
            return callback(callback);
        };

        socket.join(user.room)
        /* We are going to use addUser here to keep track of them. Running only when the user has been added. user.room is the output of 
        the function addUser */
        //***Look into REST operador (SPREAD operator)

        socket.emit("message", generateMessage("Admin", "Welcome!"));
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined!`));
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        /* This will let the others users know that there is this new user that came into the chat room */
        
        callback()
        //This means without any errors 
    });
    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id)
   
/* It gives me an error because im using user.room outside of the function that I have declared it in. I would have to find a way to be
be able to declare it as a global variable so that I do not have that problem */
        io.to(user.room).emit("message", generateMessage(user.username, message));
        callback();
    });
// Now that we are tracking users its possible to send messages to just those rooms with just these few lines of code
/* This line gives the users a chance to share their location with a hyperlink that other users can click to see where in the world
these users are located */
    socket.on("sendLocation", (position, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, "https://google.com/maps?q=${position.latitude},${position.longitude}"));
        callback();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left`))
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
            // This keeps the server updated with the users in the room, and populates the side bar of the current users in the specific room  
            // the .to() method sends this message to users to only in this room.
        }
        
    });

    /* When we are working with socket.io and transferring data 
    we are sending and receiving what are called events, so right now what 
    will be done is send an event from the server and i want to receive that event on the client.
    To send an event we use socket.emit on the server, it is made up of at least one thing, the name of the event
    in this case there is a default oine called connection, but we will make a custom one, called countUpdated 
    used to send the initial count to the client and will also be used later on to send any changes to the count */
    /* so in summary what are we doing, we are: sending the current count to thaty specific connection on line 29 */


    /* When we use socket.emit, we are emitting the event to a particular connection in this we dont want to emit it to a single connection
    we want to emit it to every connection available. By changing socket.emit to io.emit it will make that happen and all the connection will
    be updated */

});


server.listen(port, () => {
    console.log(`Server is up and running in ${port}`);
});


/* server (emit) -> client (receive) -> countUpdate
client (emit) -> server (receive) -> increment */


/*We have everything we need to actually configure the server
We going to use the express static middleware to serve up whatever is at the
publicDirectoryPath this is all done on lines 1-13
*/

/*WebSocket protocol is used when creating real time applications with Node.JS Set up communications: starts with the server, clients can 
connect. Full duplix communication - they both can initiate communications with one another.The difference between HTTP requests and 
WebSockerts is that HTTP requests is one way communications. This is important when making a chat app persistent communication
*/

/* What we just did when we tweeked up this page and refactored
was that we created teh server outside of the express library
we are creating it ourselves and configuring it to use our express app,
then we are starting it up using server.listen. With this in place it is
going to be easy to set up socket.io. Socket IO is expected to be called
with the raw http server when express creates that behind the scenes,
we do not have access to that to pass it to the const io, which is why
we have created it on our own with the const name server.
*/

/* Event acknowledgement allows the receiver of the event to acknowledged that it received and processed the event. An example will be 
sending a message or location. With an acknowledgement the server gets notified that the client got the message. By having acknoledgement 
we will need to add a callback function to whoever is emitting the event, whoever is receiving the event receives a callback function that 
needs to be called and optional it can also send data back and forth. A good way to make sure that there is no bad words in the app is 
to use acknoledgement. Acknoledgements are very useful for real time applications, it allows the emitter to actually know that the events
that they are trying to perform went as expected */

/* We are going to be talking about rooms in socket.io, that is going to allow us to emit events to a specific set of connections so people 
in that specific room that they have joined. So, we would have seperate chat rooms for different topics. We are going to use socket.io for 
a fourth time on this file to have a listener for that event of having people join the chat room, we have access to username and room as 
individual variables from here what we are going to do is use the socketio features given to us to actually join these individual rooms.
To do this we use a method only used in the server called socket.join allows us to join a given chat room and we pass through it the room
that we are trying to join. This is going to give us access to a whole new way to emit events where we are specifically emitting events to
just that room. So, the people in that chat room are the only ones that will be able to see them. From server to Client.
So far we have done Server to client three different ways:
socket.emit, io.emit, socket.broadcast.emit
There are two more ways to emit data using rooms: 
io.to.emit, socket.broacast.to.emit - sending an event to everyone except that person in that specific chat room
 */

//We will have to make a constant and that constant will have the value for room. We can then use that constant where we need to talk from the client to the server 

/* The whole point of tracking users was to make sure we had access to things like username and room name throughout our other event listeners 
as well. When we emit things we would like to have it emitted to the correct chat rooms we are also going to include users usernames as well 
as their messages so we can render those to the screen as well */

/* Goal is that the object being sent back to the client contains all of the info it needs, now in messages.js for genererateMessageLocation, this takes in
the URL and sends back the object of the URL and created app, we are also going to have it send in the username and have it send back as well */

/* Auto scrolling means having the browser automatically scroll to the newest messages when it does not have room on the page to display all of the messages */