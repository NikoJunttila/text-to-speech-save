# Azure Congnitive Services Text-to-Speech Project

This project demonstrates how to use Azure Cognitive Services to convert text to speech using Node.js.

## Prerequisites

- Node.js (v18.x or later)
- An Azure account with access to Cognitive Services
- Azure Speech service subscription key and region

## Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/Sid-ah/openai-tts.git
   cd openai-tts
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your Azure Speech service subscription key and region:

   ```plaintext
   SPEECH_KEY=your_subscription_key
   SPEECH_REGION=your_service_region
   ```

## Running the Project

To run the project and generate the speech audio file:

```sh
node main.js
```
