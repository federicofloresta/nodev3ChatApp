const users = [];

// addUser 
const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim()
    room = room.trim()

    //Validate the data
    if (!username || !room) {
        return {
            error: "Username and room are required"
        }
    };

    // Check for existing user
    const duplicateUser = users.find((user) => {
        return user.room === room && user.username === username
    });

    // Validate username
    if (duplicateUser) {
        return {
            error: "That username is in use!"
        }
    };

    //Store user
    const user = { id,username,room }
    users.push(user)
    return { user }
};

//removeUser
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

//getUser
const getUser = (id) => {
    return users.find((user)=> user.id === id) 

}
/* Accepts the ID of the user and returns the user object if there is a match, otherwise we will return undefined. Same as user.id,
where the user is the object and we are using the id method to pinpoint the ID of that specific user. */  

//getUsersInRoom
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
    
}

/* This will accept the room name and will return an array of users that are in that specific room or an aempty array if no users are in 
that room, user.room means that we are looking for users in that specific room object is user and the method that we are using on that object
is room */ 

module.exports = {
    getUser,
    getUsersInRoom,
    addUser,
    removeUser
};

// This file manages the users who are joining 