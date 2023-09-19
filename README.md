# Slack Clone Client Repository

- Api repository https://github.com/adeolaadeoti/slack-clone-api

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Installation](#installation)
- [Usage](#usage)
  - [User Registration](#user-registration)
  - [Creating Channels](#creating-channels)
  - [Sending Messages](#sending-messages)
  - [Message Replies (Threads)](#message-replies-threads)
  - [Huddle with Other Users](#huddle-with-other-users)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Slack clone is a powerful team collaboration platform that allows you to communicate and collaborate with your team members in real-time. Whether you're working remotely or in the same office, our application provides a seamless and efficient way to stay connected.

![Screenshot](https://res.cloudinary.com/adeolaadeoti/image/upload/v1695161023/screenshot_jsd2mf.png)

## Features

- Real-time chat and messaging
- Channel-based communication
- Direct messaging between users
- File and media sharing
- Customizable notifications
- **Message Replies (Threads)**
  - Start threads to reply to specific messages in a conversation.
  - Keep discussions organized and focused.
- **Huddle with Other Users**
  - Create private huddles for group discussions.
  - Collaborate with select team members in a secure environment.

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/adeolaadeoti/slack-clone-client.git
   ```

2. Change to the project directory:

   ```bash
   cd slack-clone-client
   ```

3. Install dependencies:

   ```bash
   yarn
   ```

4. Set up environment variables:

   Create a `.env.local` file in the root directory of the project and add the necessary environment variables, including your database connection details and any API keys.

   ```plaintext
   NEXT_PUBLIC_API=http://localhost:8080/api/v1
   NEXT_PUBLIC_SOCKET=http://localhost:8080
   ```

5. Start the application:

   ```bash
   yarn start
   ```

6. Access the application at `http://localhost:3000`.

## Usage

### User Registration

1. Visit the application's URL.

2. Click on the "Sign Up" or "Register" button to create a new user account.

3. Fill out the registration form with your details.

4. Once registered, you can log in with your credentials.

### Creating Channels

1. After logging in, you can create a new channel by clicking on the "Create Channel" button.

2. Choose a name and description for your channel.

3. Invite team members to join the channel.

### Sending Messages

1. To send a message in a channel, click on the channel's name in the left sidebar.

2. Type your message in the input field at the bottom of the chat window and press Enter to send.

3. You can also send direct messages to other users by clicking on their name in the user list.

### Message Replies (Threads)

1. To start a thread in response to a specific message:

   - Hover over the message you want to reply to.

   - Click on the "Reply" or "Start Thread" button.

   - Type your reply in the thread and send it.

2. Keep discussions organized by using threads to respond to messages.

### Huddle with Other Users

1. To create a private huddle:

   - Click on the "Huddle" button in the sidebar.

   - Select the users you want to include in the huddle.

   - Start your private conversation.

2. Huddles provide a secure environment for group discussions with select team members.

## Contributing

We welcome contributions from the community.

## License

This project is licensed under the [MIT License](LICENSE).
