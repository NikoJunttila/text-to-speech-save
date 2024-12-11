import sdk from "microsoft-cognitiveservices-speech-sdk";
import dotenv from 'dotenv';
import fs from "fs";
import path from "path";

// Configure environment variables
dotenv.config();

// Escape XML special characters
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

// Split text into chunks
function splitTextIntoChunks(text, maxChunkLength = 3000) {
    const chunks = [];
    let currentChunk = '';

    // Split by sentences to avoid cutting mid-sentence
    const sentences = text.split(/(?<=[.!?])\s+/);

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChunkLength) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += ' ' + sentence;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

// Async function to read text file
async function readTextFile(filePath) {
    try {
        const text = await fs.promises.readFile(filePath, 'utf8');
        return escapeXml(text.trim()); // Escape XML special characters and trim whitespace
    } catch (error) {
        console.error('Error reading file:', error);
        return '';
    }
}

// Create SSML for a chunk of text
function createSsml(text) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="en-US-AndrewMultilingualNeural">
        <prosody rate="medium" pitch="medium">
            <p>${text}</p>
        </prosody> 
    </voice>
</speak>`;
}

// Synthesize a single chunk of text
async function synthesizeSingleChunk(text, subscriptionKey, serviceRegion, outputFile) {
    const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputFile);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(
            createSsml(text),
            (result) => {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    console.log(`Synthesis finished for chunk: ${outputFile}`);
                    synthesizer.close();
                    resolve(outputFile);
                } else {
                    console.error(
                        "Speech synthesis canceled, " +
                        result.errorDetails +
                        "\nDid you set the speech resource key and region values?"
                    );
                    synthesizer.close();
                    reject(new Error(result.errorDetails));
                }
            },
            (err) => {
                console.error("err - ", err);
                synthesizer.close();
                reject(err);
            }
        );
    });
}

// Main function to synthesize speech
async function synthesizeSpeech() {
    const subscriptionKey = process.env.SPEECH_KEY;
    const serviceRegion = process.env.SPEECH_REGION;
    const filePath = './done/eng_4.txt';

    // Read text file
    const fullText = await readTextFile(filePath);

    // Split text into chunks
    const textChunks = splitTextIntoChunks(fullText);

    // Synthesize each chunk to a separate audio file
    const audioFiles = [];
    for (let i = 0; i < textChunks.length; i++) {
        const outputFile = `outputaudio_chunk_${i + 1}.wav`;
        try {
            await synthesizeSingleChunk(textChunks[i], subscriptionKey, serviceRegion, outputFile);
            audioFiles.push(outputFile);
        } catch (error) {
            console.error(`Error synthesizing chunk ${i + 1}:`, error);
        }
    }

    return audioFiles;
}

async function main() {
  try {
      await synthesizeSpeech();
  } catch (error) {
      console.error('Speech synthesis failed:', error);
  }
}

main();