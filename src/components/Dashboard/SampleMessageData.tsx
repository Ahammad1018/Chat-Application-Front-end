const sampleMessages = [
  {
    "id": "conv_1001",
    "sender": "alice",
    "receiver": "bob",
    "message": "Hello Bob!",
    "messageType": "text",
    "status": "sent",
    "createdAt": "2025-05-20T10:15:30",
    "fileSize": null,
    "isReplied": false,
    "repliedBy": null,
    "repliedMessageId": null
  },
  {
    "id": "conv_1002",
    "sender": "bob",
    "receiver": "alice",
    "message": "https://creator.nightcafe.studio/jobs/CYL3H4sXpnIqsGfAXPco/CYL3H4sXpnIqsGfAXPco--1--jv925.jpg",
    "messageType": "image",
    "status": "delivered",
    "createdAt": "2025-05-20T10:16:12",
    "fileSize": null,
    "isReplied": false,
    "repliedBy": null,
    "repliedMessageId": null
  },
  {
    "id": "conv_1003",
    "sender": "alice",
    "receiver": "bob",
    "message": "That's a beautiful image!",
    "messageType": "text",
    "status": "read",
    "createdAt": "2025-05-20T10:17:45",
    "fileSize": null,
    "isReplied": true,
    "repliedBy": "alice",
    "repliedMessageId": "conv_1002"
  },
  {
    "id": "conv_1004",
    "sender": "bob",
    "receiver": "alice",
    "message": "https://i.pinimg.com/564x/22/48/c2/2248c2b77097b89517fbe9385ffd3ae5.jpg",
    "messageType": "image",
    "status": "sent",
    "createdAt": "2025-05-20T11:05:10",
    "fileSize": null,
    "isReplied": false,
    "repliedBy": null,
    "repliedMessageId": null
  },
  {
    "id": "conv_1005",
    "sender": "alice",
    "receiver": "bob",
    "message": "Love this photo!",
    "messageType": "text",
    "status": "delivered",
    "createdAt": "2025-05-20T11:06:00",
    "fileSize": null,
    "isReplied": true,
    "repliedBy": "alice",
    "repliedMessageId": "conv_1004"
  },
  {
    "id": "conv_1006",
    "sender": "bob",
    "receiver": "alice",
    "message": "Where are we meeting today?",
    "messageType": "text",
    "status": "sent",
    "createdAt": "2025-05-20T11:10:30",
    "fileSize": null,
    "isReplied": false,
    "repliedBy": null,
    "repliedMessageId": null
  },
  {
    "id": "conv_1007",
    "sender": "alice",
    "receiver": "bob",
    "message": "Same cafe as last week, 4 PM?",
    "messageType": "text",
    "status": "read",
    "createdAt": "2025-05-20T11:12:05",
    "fileSize": null,
    "isReplied": true,
    "repliedBy": "alice",
    "repliedMessageId": "conv_1006"
  },
  {
    "id": "conv_1008",
    "sender": "bob",
    "receiver": "alice",
    "message": "Perfect, see you there!",
    "messageType": "text",
    "status": "delivered",
    "createdAt": "2025-05-20T11:13:15",
    "fileSize": null,
    "isReplied": false,
    "repliedBy": null,
    "repliedMessageId": null
  },
  {
    "id": "conv_1009",
    "sender": "bob",
    "receiver": "alice",
    "message": "https://i.pinimg.com/736x/d2/1a/9c/d21a9c6454510353dcee048b65a82bbb.jpg",
    "messageType": "image",
    "status": "sent",
    "createdAt": "2025-05-20T11:15:40",
    "fileSize": null,
    "isReplied": true,
    "repliedBy": "bob",
    "repliedMessageId": "conv_1002"
  },
  {
    "id": "conv_1010",
    "sender": "alice",
    "receiver": "bob",
    "message": "You've got an eye for art.",
    "messageType": "file",
    "status": "read",
    "createdAt": "2025-05-20T11:16:30",
    "fileSize": null,
    "isReplied": true,
    "repliedBy": "alice",
    "repliedMessageId": "conv_1009"
  },
    {
    "id": "conv_1011",
    "sender": "bob",
    "receiver": "alice",
    "message": `Hey Bob,
I've compiled the full report from last quarter. Here are the highlights:

Revenue increased by 18%
Churn dropped from 9.2% to 7.6%
The most engaged user segment was 25–34, mostly using mobile devices
Our support ticket volume dropped 15% after the chatbot upgrade
There are also some weak spots, particularly around the payment funnel and onboarding conversion. I’ve detailed those in the attached spreadsheet. Please review it before our call with leadership tomorrow.

https://images.nightcafe.studio/jobs/CYL3H4sXpnIqsGfAXPco/CYL3H4sXpnIqsGfAXPco--1--jv925.jpg

+91 9191919191

Best`,
    "messageType": "text",
    "status": "read",
    "createdAt": "2025-05-20T11:16:30",
    "fileSize": null,
    "isReplied": false,
    "repliedBy": null,
    "repliedMessageId": null
  },
    {
    "id": "conv_1012",
    "sender": "alice",
    "receiver": "bob",
    "message": "You've got an eye for art.",
    "messageType": "text",
    "status": "read",
    "createdAt": "2025-05-20T11:16:30",
    "fileSize": null,
    "isReplied": true,
    "repliedBy": "alice",
    "repliedMessageId": "conv_1011"
  }
];

export default sampleMessages;