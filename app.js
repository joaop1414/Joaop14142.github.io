const appID = "260144635bc76c73";
const region = "US";
const authKey = "d019a6272078f064b664f028fa2d0266f029de44";

// Inicializar o CometChat
const appSetting = new CometChat.AppSettingsBuilder()
    .subscribePresenceForAllUsers()
    .setRegion(region)
    .build();

CometChat.init(appID, appSetting).then(
    () => {
        console.log("Initialization completed successfully");
        // Login ou registrar usuário
        const UID = "user1";
        const user = new CometChat.User(UID);

        user.setName("User One");

        CometChat.createUser(user, authKey).then(
            user => {
                console.log("User created", user);
                CometChat.login(UID, authKey).then(
                    user => {
                        console.log("Login successful", user);
                        initializeChat();
                    },
                    error => {
                        console.log("Login failed", error);
                    }
                );
            },
            error => {
                if(error.code === "ERR_UID_ALREADY_EXISTS") {
                    CometChat.login(UID, authKey).then(
                        user => {
                            console.log("Login successful", user);
                            initializeChat();
                        },
                        error => {
                            console.log("Login failed", error);
                        }
                    );
                } else {
                    console.log("Error creating user", error);
                }
            }
        );
    },
    error => {
        console.log("Initialization failed", error);
    }
);

function initializeChat() {
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messages = document.getElementById('messages');

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = messageInput.value;
        if (messageText.trim()) {
            const receiverID = "user2";  // O ID do destinatário
            const messageType = CometChat.MESSAGE_TYPE.TEXT;
            const receiverType = CometChat.RECEIVER_TYPE.USER;
            const textMessage = new CometChat.TextMessage(
                receiverID,
                messageText,
                messageType,
                receiverType
            );

            CometChat.sendMessage(textMessage).then(
                message => {
                    console.log("Message sent successfully:", message);
                    addMessageToList(messageText);
                    messageInput.value = '';
                },
                error => {
                    console.log("Message sending failed:", error);
                }
            );
        }
    });

    function addMessageToList(messageText) {
        const messageElement = document.createElement('li');
        messageElement.textContent = messageText;
        messages.appendChild(messageElement);
        messages.scrollTop = messages.scrollHeight;
    }

    // Ouvir mensagens recebidas
    const listenerID = "UNIQUE_LISTENER_ID";
    CometChat.addMessageListener(
        listenerID,
        new CometChat.MessageListener({
            onTextMessageReceived: message => {
                console.log("Text message received:", message);
                addMessageToList(message.text);
            }
        })
    );
}
