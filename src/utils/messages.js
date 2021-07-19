const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
// By adding the username this will render the correct username next to the message that is being sent
};
const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
};


module.exports = {
    generateMessage,
    generateLocationMessage
}