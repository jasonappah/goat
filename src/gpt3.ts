import axios from 'axios'
import { parseChatResponse } from './messages'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) throw Error('No openAI API key set')

// https://beta.openai.com/docs/api-reference/create-completion
interface GPT3Params {
  prompt: string
  max_tokens: number
  temperature: number // sampling temp: https://towardsdatascience.com/how-to-sample-from-language-models-682bceb97277
  top_p?: number
  frequency_penalty?: number // Frequency and presence penalties: https://beta.openai.com/docs/api-reference/parameter-details
  presence_penalty?: number
  echo?: boolean // Echo back the prompt as well as completion; defaults to false
  stop?: string[] | string // Stop completion indicators
  best_of?: number // Returns best completion of best_of completions
}

type GPT3Engine = 'curie-instruct-beta' | 'curie' | 'davinci' | 'davinci-instruct-beta'

async function getGPT3Completion(params: GPT3Params, engine: GPT3Engine = 'davinci') {
  const { data } = await axios.post(`https://api.openai.com/v1/engines/${engine}/completions`, params, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })

  return data?.choices && data.choices[0].text
}

const initialChatLog = `Conversation with Goat, a funny, friendly, polite goat AI that's slightly cocky and lives in the hacker pasture with a cow.

You: Hello! Who are you?
Goat: I'm the Hack Club Goat, your intelligent neighborhood goat! BAAAA :goat:
You: You're really smart!
Goat: I know :wink:
You: I like you
Goat: I love you too :green_heart:
You: What's the best OS
Goat: macOS is the best OS`

const preMessage = `You: `
const preResponse = `Goat:`

function fixConversationLog(log: string): string {
  // Clean duplicate responses to prevent the cow from getting stuck in a loop
  const [description, conversation] = log.split('\n\n')
  let lines = conversation.split('\n') // Use a set to eliminate duplicates
  const filteredLines = [...lines]
  const seen = []
  for (const [i, l] of lines.entries()) {
    if (seen.indexOf(l) < 0) {
      seen.push(l)
    } else {
      // Only remove if this is a bot response. Duplicate user messages are assumed to be intentional.
      if (l.startsWith(preResponse)) filteredLines.splice(i - 1, i) // Remove message and response.
    }
  }
  return description + '\n\n' + filteredLines.join('\n')
}

export async function getChatResponse(message: string, chatLog?: string, ): Promise<[response: string, log: string]> {

  const prompt = (chatLog || initialChatLog) + `\n${preMessage}${message}\n${preResponse}`

  const completionParams: GPT3Params = {
    prompt,
    max_tokens: 128,
    temperature: 0.75,
    top_p: 1,
    frequency_penalty: 0.2,
    presence_penalty: 0.9,
    best_of: 2,
    stop: ['\n'],
  }

  const response = parseChatResponse(await getGPT3Completion(completionParams, process.env.GPT3_ENGINE as GPT3Engine || 'davinci' ))
  const newLog = fixConversationLog(prompt + ' ' + response) // Full conversation history

  return [response, newLog]
}
